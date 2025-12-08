import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';
import { getRateLimiter, RateLimitConfigs } from '@/lib/rate-limit';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  // 🔒 PROTECCIÓN: Solo administradores pueden subir imágenes
  const authResult = requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const { user } = authResult;

  // 🔥 CRÍTICO: Rate limiting para uploads (incluso para admins)
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const limiter = getRateLimiter();
  const { allowed } = limiter.check(
    `upload:${ip}`,
    RateLimitConfigs.upload.maxRequests,
    RateLimitConfigs.upload.windowMs,
    RateLimitConfigs.upload.blockDurationMs
  );

  if (!allowed) {
    console.warn(`🚨 UPLOAD BLOQUEADO - Admin: ${user.id} - IP: ${ip}`);
    return NextResponse.json(
      { error: RateLimitConfigs.upload.message },
      { status: 429 }
    );
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const productId = data.get('productId') as string;
    const imageIndex = data.get('imageIndex') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce/products',
          public_id: `product-${productId}-img${imageIndex}-${Date.now()}`, 
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, 
            { quality: 'auto' },
            { format: 'auto' } 
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const uploadResult = result as any;

    return NextResponse.json({ 
      success: true, 
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      message: 'Image uploaded successfully' 
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}