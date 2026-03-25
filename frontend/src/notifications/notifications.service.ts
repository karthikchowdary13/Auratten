import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@auratten.io';

export const notificationsService = {
    /**
     * Sends absence alert email to parent via AWS SES
     */
    async sendAbsenceAlertToParent(studentName: string, parentEmail: string, className: string, date: string) {
        const params = {
            Destination: { ToAddresses: [parentEmail] },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e11d48;">Attendance Alert</h2>
                <p>Hello,</p>
                <p>This is to inform you that <strong>${studentName}</strong> was marked <strong>ABSENT</strong> for the class <strong>${className}</strong> on <strong>${date}</strong>.</p>
                <p>Monitoring regular attendance is crucial for academic success. You can view the complete attendance report by clicking the link below:</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View Full Report</a>
                <br/><br/>
                <p>Regards,<br/>Auratten Attendance System</p>
              </div>
            `,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: `Attendance Alert — ${studentName} was absent today`,
                },
            },
            Source: FROM_EMAIL,
        };

        try {
            const command = new SendEmailCommand(params);
            const response = await sesClient.send(command);
            return response.MessageId;
        } catch (error) {
            console.error("Error sending absence alert:", error);
            throw error;
        }
    },

    /**
     * Sends attendance confirmation email to student
     */
    async sendAttendanceConfirmation(studentEmail: string, className: string, markedAt: string) {
        const params = {
            Destination: { ToAddresses: [studentEmail] },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #059669;">Attendance Marked Successfully</h2>
                <p>Hello,</p>
                <p>Your attendance for <strong>${className}</strong> has been successfully recorded at <strong>${markedAt}</strong>.</p>
                <p>Keep up the great work!</p>
                <br/>
                <p>Regards,<br/>Auratten Team</p>
              </div>
            `,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: `Attendance Marked — ${className}`,
                },
            },
            Source: FROM_EMAIL,
        };

        try {
            const command = new SendEmailCommand(params);
            const response = await sesClient.send(command);
            return response.MessageId;
        } catch (error) {
            console.error("Error sending confirmation:", error);
            throw error;
        }
    },

    /**
     * Sends low attendance warning via SNS
     */
    async sendLowAttendanceWarning(studentEmail: string, parentEmail: string, percentage: number, studentName: string) {
        const message = `CRITICAL ATTENDANCE WARNING: ${studentName}'s attendance has dropped to ${percentage}%. This is below the required 75% threshold. Please review immediately.`;

        const params = {
            Message: message,
            TopicArn: process.env.SNS_TOPIC_ARN,
            MessageAttributes: {
                'StudentName': { DataType: 'String', StringValue: studentName },
                'Percentage': { DataType: 'Number', StringValue: percentage.toString() }
            }
        };

        try {
            const command = new PublishCommand(params);
            const response = await snsClient.send(command);
            return response.MessageId;
        } catch (error) {
            console.error("Error publishing low attendance warning:", error);
            throw error;
        }
    }
};
