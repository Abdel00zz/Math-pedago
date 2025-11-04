import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, chapterTitle, progressData } = req.body;

    // Validate required fields
    if (!studentName || !chapterTitle || !progressData) {
      return res.status(400).json({
        error: 'Missing required fields: studentName, chapterTitle, or progressData'
      });
    }

    // Parse progressData if it's a string
    const parsedData = typeof progressData === 'string'
      ? JSON.parse(progressData)
      : progressData;

    // Create filename
    const sanitizedName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const filename = `progression_${sanitizedName}_${timestamp}.json`;

    // Convert JSON to Buffer for attachment
    const jsonBuffer = Buffer.from(JSON.stringify(parsedData, null, 2), 'utf-8');

    // Email recipient (from environment variable or default)
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'bdh.malek@gmail.com';

    // Send email with attachment using Resend
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Math Pedago <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `✅ Nouveau travail soumis: ${studentName} - ${chapterTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }
              .info-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
              .info-table td:first-child { font-weight: bold; width: 40%; background: #f5f5f5; }
              .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 12px; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
              .attachment-info { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; border-radius: 4px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 Nouveau Travail Soumis</h1>
              </div>
              <div class="content">
                <p>Un étudiant vient de soumettre son travail :</p>

                <table class="info-table">
                  <tr>
                    <td>👤 Étudiant</td>
                    <td><strong>${studentName}</strong></td>
                  </tr>
                  <tr>
                    <td>📖 Chapitre</td>
                    <td><strong>${chapterTitle}</strong></td>
                  </tr>
                  <tr>
                    <td>� Progression Leçon</td>
                    <td><strong>${parsedData.results?.[0]?.lesson?.completed || 0} / ${parsedData.results?.[0]?.lesson?.total || 0}</strong> paragraphes (${parsedData.results?.[0]?.lesson?.percentage?.toFixed(1) || 0}%)</td>
                  </tr>
                  <tr>
                    <td>�📊 Score Quiz</td>
                    <td><strong>${parsedData.results?.[0]?.quiz?.scoreRaw || 'N/A'}</strong> (${parsedData.results?.[0]?.quiz?.score?.toFixed(1) || 0}%)</td>
                  </tr>
                  <tr>
                    <td>⏱️ Durée Totale</td>
                    <td><strong>${Math.round((parsedData.results?.[0]?.totalDurationSeconds || 0) / 60)} minutes</strong></td>
                  </tr>
                  <tr>
                    <td>📅 Date de Soumission</td>
                    <td><strong>${parsedData.submissionDate}</strong></td>
                  </tr>
                  <tr>
                    <td>✏️ Exercices Évalués</td>
                    <td><strong>${Object.keys(parsedData.results?.[0]?.exercisesFeedback || {}).length} exercices</strong></td>
                  </tr>
                </table>

                <div class="attachment-info">
                  <strong>📎 Fichier joint :</strong> ${filename}<br>
                  <small>Le fichier JSON contient tous les détails de la progression de l'étudiant.</small>
                </div>

                <div class="footer">
                  <p>🤖 Email envoyé automatiquement par Math Pedago via Resend</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename,
          content: jsonBuffer,
        },
      ],
    });

    console.log('Email sent successfully:', data);

    // Return success response
    return res.status(200).json({
      success: true,
      messageId: data?.data?.id || 'unknown',
      message: 'Work submitted successfully'
    });

  } catch (error: any) {
    console.error('Error sending email:', error);

    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
      name: error.name
    });
  }
}
