import emailjs from '@emailjs/browser';

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  baseUrl: string;
}

// ✅ Función que recibe la configuración como parámetro
export async function sendResetPasswordEmailClient(
  email: string, 
  resetToken: string, 
  nombre: string,
  config: EmailConfig
) {
  console.log('🔍 Debug email.ts: Iniciando envío de email');
  console.log('🔍 Debug email.ts: Parámetros recibidos:', { 
    email, 
    resetToken: resetToken.substring(0, 10) + '...', 
    nombre 
  });
  console.log('🔍 Debug email.ts: Configuración recibida:', config);
  
  // Verificar configuración recibida
  if (!config.serviceId || !config.templateId || !config.publicKey || !config.baseUrl) {
    const errorMsg = `Faltan parámetros de configuración de EmailJS: 
    Service ID: ${config.serviceId ? 'OK' : 'FALTANTE'}
    Template ID: ${config.templateId ? 'OK' : 'FALTANTE'}
    Public Key: ${config.publicKey ? 'OK' : 'FALTANTE'}
    Base URL: ${config.baseUrl ? 'OK' : 'FALTANTE'}`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    // Inicializar EmailJS en el cliente
    console.log('🔍 Debug email.ts: Inicializando EmailJS con key:', config.publicKey);
    emailjs.init(config.publicKey);
    
    const resetUrl = `${config.baseUrl}/auth/reset-password?token=${resetToken}`;
    console.log('🔍 Debug email.ts: Reset URL generada:', resetUrl);

    const templateParams = {
      to_email: email,
      to_name: nombre,
      reset_url: resetUrl,
      company_name: 'CellPhone Free'
    };
    
    console.log('🔍 Debug email.ts: Template params:', templateParams);
    console.log('🔍 Debug email.ts: Enviando email con EmailJS...');
    
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams
    );
    
    console.log('✅ Email enviado exitosamente con EmailJS:', response);
    console.log('✅ Status:', response.status);
    console.log('✅ Text:', response.text);
    
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error detallado en email.ts:', error);
    console.error('❌ Tipo de error:', typeof error);
    console.error('❌ Message:', (error as any)?.message);
    console.error('❌ Status:', (error as any)?.status);
    console.error('❌ Text:', (error as any)?.text);
    console.error('❌ Error completo:', JSON.stringify(error, null, 2));
    
    let errorMessage = 'Error desconocido al enviar email';
    if ((error as any)?.message) {
      errorMessage = (error as any).message;
    } else if ((error as any)?.text) {
      errorMessage = (error as any).text;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    throw new Error(`Error al enviar email de recuperación: ${errorMessage}`);
  }
}