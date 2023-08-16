import AWS from 'aws-sdk'
import axios from 'axios'

const s3config = {
    s3ForcePathStyle: true
}

const sesConfig = {
    apiVersion: '2010-12-01'
}

const isLocal = true

if(isLocal) {
    AWS.config.update({
        credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test'
        },
        region: 'us-east-1'
    })
    
    const host =  process.env.LOCALSTACK_HOST || 'localhost'
    const awsEndpoint = new AWS.Endpoint(`http://${host}:4566`);

    //@ts-ignore
    s3config.endpoint = awsEndpoint
    //@ts-ignore
    sesConfig.endpoint = awsEndpoint
}

const s3 = new AWS.S3(s3config);
const ses = new AWS.SES(sesConfig)

class TestUploadS3 {
    public async execute() {
        const image = 'https://www.purina.co.uk/sites/default/files/2020-12/Dog_1098119012_Teaser.jpg'

        const buffer = await this.downloadImage(image);
        const upload = await this.upload(buffer);

        // await this.remove(upload.Key);
    }

    private async downloadImage(imageUrl: string) {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        })

        const buffer = Buffer.from(response.data, 'base64');
        return buffer
    }

    private async upload(buffer: Buffer) {
        const s3Upload = await s3.upload({
            Bucket: 'local-data-files-2',
            Key: `FILE_${(new Date()).getTime()}`,
            Body: buffer
        }).promise();

        return s3Upload
    }

    private async remove(key: string) {
        await s3.deleteObject({
            Bucket: 'local-data-files-2',
            Key: key
        })
    }
}

class SendEmailSES {
    public async execute() {
        const file = 'FILE_1692213563261'

        console.log('Getting Image ...')
        const urlSigned = s3.getSignedUrl('getObject', {
            Bucket: 'local-data-files-2',
            Key: 'FILE_1692220420701',
        });

        console.log({urlSigned})

        console.log('transforming into buffer ...')
        const imageBuffered = await axios.get(urlSigned, {
            responseType: 'arraybuffer'
        });

        var params = {
            Destination: {
             BccAddresses: [
             ], 
             CcAddresses: [
                'agavi2014@hotmail.com'
             ], 
             ToAddresses: [
                'agavi2014@hotmail.com', 
                'agavi2014@hotmail.com'
             ]
            }, 
            Message: {
             Body: {
              Html: {
               Charset: "UTF-8", 
               Data: "This message body contains HTML formatting. It can, for example, contain links like this one: <a class=\"ulink\" href=\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide\" target=\"_blank\">Amazon SES Developer Guide</a>."
              }, 
              Text: {
               Charset: "UTF-8", 
               Data: "This is the message body in text format."
              }
             }, 
             Subject: {
              Charset: "UTF-8", 
              Data: "Test email"
             }
            }, 
            ReplyToAddresses: [
            ], 
            ReturnPath: "", 
            ReturnPathArn: "", 
            Source: "teste@mailinator.com", 
            SourceArn: ""
           };

        const emailSend = ses.sendEmail(params).promise()

        console.log(emailSend)
    }
}

const test = new TestUploadS3()
const testSES = new SendEmailSES()

testSES.execute()

// test.execute()