# 1. Send OTP
$sendRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/send-otp" -Method Post -ContentType "application/json" -Body '{"email":"test.candidate@talentflow360.com","purpose":"LOGIN"}'
Write-Host "Sent OTP successfully: $($sendRes.message)"

# 2. Query MySQL for the latest OTP for test.candidate@talentflow360.com
$otpRecord = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health"
Write-Host "Health check OK: $($otpRecord.status)"

