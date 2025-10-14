import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/data/mysql';
import { ForgotPasswordRequest } from '@/types/types';
import { generateResetToken, generateTokenExpiry } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { email }: ForgotPasswordRequest = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email no válido' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.query('SET SESSION wait_timeout=300');
    await connection.query('SET SESSION interactive_timeout=300');

    const [clienteRows] = await connection.query(
      'SELECT id, nombre, apellido, email FROM clientes WHERE email = ?',
      [email]
    );

    if ((clienteRows as any).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    const cliente = (clienteRows as any)[0];

    const resetToken = generateResetToken();
    const tokenExpiry = generateTokenExpiry();

    await connection.query(
      `INSERT INTO clientes_auth (cliente_id, reset_token, reset_token_expires) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       reset_token = VALUES(reset_token), 
       reset_token_expires = VALUES(reset_token_expires)`,
      [cliente.id, resetToken, tokenExpiry]
    );

    //console.log(`✅ Token de reset generado para: ${cliente.email} (Cliente ID: ${cliente.id})`);

    return NextResponse.json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña',
      emailData: {
        email: cliente.email,
        nombre: cliente.nombre,
        resetToken: resetToken
      },
      emailConfig: {
        serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud. Intenta nuevamente.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('🔴 Error al liberar conexión en forgot-password:', releaseError);
      }
    }
  }
}