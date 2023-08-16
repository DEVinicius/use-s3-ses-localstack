BUCKET_NAME=local-data-files-2

aws \
    s3 mb s3://$BUCKET_NAME \
    --endpoint http://localhost:4566

aws \
    s3 ls \
    --endpoint http://localhost:4566

aws \
    s3 ls s3://$BUCKET_NAME\
    --endpoint http://localhost:4566

aws \
    s3 cp teste.txt s3://$BUCKET_NAME\
    --endpoint http://localhost:4566

aws s3 put-object \
  --bucket $BUCKET_NAME \
  --key teste.txt \
  --body teste.txt \
  --endpoint http://localhost:4566

aws ses send-email \
    --from teste@mailinator.com \
    --message 'Body={Text={Data="VINI TESTE"}},Subject={Data=Test Email}' \
    --destination 'ToAddresses=nicolas010256@gmail.com' \
    --endpoint http://localhost:4566

aws ses verify-email-identity \
    --email-address teste@mailinator.com \
    --endpoint-url=http://localhost:4566
