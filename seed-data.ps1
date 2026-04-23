$API = "http://localhost:8080/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "`n===== Seeding Smart Campus Database =====" -ForegroundColor Cyan

# ==================== MODULE E: USERS ====================
Write-Host "`n[1/5] Creating Users..." -ForegroundColor Yellow

$users = @(
    @{ name = "Admin User"; email = "admin@smartcampus.lk"; password = "admin123" },
    @{ name = "Dineesha Perera"; email = "dineesha@smartcampus.lk"; password = "pass123" },
    @{ name = "Lasitha Fernando"; email = "lasitha@smartcampus.lk"; password = "pass123" },
    @{ name = "Kanishka Silva"; email = "kanishka@smartcampus.lk"; password = "pass123" },
    @{ name = "Sulochana Dias"; email = "sulochana@smartcampus.lk"; password = "pass123" },
    @{ name = "Tech Support"; email = "tech@smartcampus.lk"; password = "pass123" },
    @{ name = "Security Guard"; email = "security@smartcampus.lk"; password = "pass123" }
)

$createdUsers = @()
foreach ($u in $users) {
    try {
        $res = Invoke-RestMethod -Uri "$API/auth/register" -Method POST -Headers $headers -Body ($u | ConvertTo-Json)
        $createdUsers += $res
        Write-Host "  + User: $($res.name) ($($res.email)) - ID: $($res.id)" -ForegroundColor Green
    } catch {
        Write-Host "  ! Skipped (may already exist): $($u.email)" -ForegroundColor DarkYellow
    }
}

# Set roles
if ($createdUsers.Count -ge 1) {
    try { Invoke-RestMethod -Uri "$API/auth/users/$($createdUsers[0].id)/role" -Method PUT -Headers $headers -Body '{"role":"ADMIN"}' | Out-Null; Write-Host "  * Set Admin" -ForegroundColor Magenta } catch {}
}
if ($createdUsers.Count -ge 6) {
    try { Invoke-RestMethod -Uri "$API/auth/users/$($createdUsers[5].id)/role" -Method PUT -Headers $headers -Body '{"role":"TECHNICIAN"}' | Out-Null; Write-Host "  * Set Technician" -ForegroundColor Magenta } catch {}
}
if ($createdUsers.Count -ge 7) {
    try { Invoke-RestMethod -Uri "$API/auth/users/$($createdUsers[6].id)/role" -Method PUT -Headers $headers -Body '{"role":"SECURITY"}' | Out-Null; Write-Host "  * Set Security" -ForegroundColor Magenta } catch {}
}

$adminId = if ($createdUsers.Count -ge 1) { $createdUsers[0].id } else { "user1" }
$user1Id = if ($createdUsers.Count -ge 2) { $createdUsers[1].id } else { "user2" }
$user2Id = if ($createdUsers.Count -ge 3) { $createdUsers[2].id } else { "user3" }
$techId  = if ($createdUsers.Count -ge 6) { $createdUsers[5].id } else { "tech1" }

# ==================== MODULE A: RESOURCES ====================
# Enums: type = LECTURE_HALL | LAB | MEETING_ROOM | EQUIPMENT
#        status = ACTIVE | OUT_OF_SERVICE
Write-Host "`n[2/5] Creating Resources..." -ForegroundColor Yellow

$resources = @(
    @{ name = "Lecture Hall A1"; type = "LECTURE_HALL"; location = "Building A, Floor 1"; capacity = 200; status = "ACTIVE"; description = "Large lecture hall with AV equipment and air conditioning" },
    @{ name = "Computer Lab 101"; type = "LAB"; location = "Building B, Floor 1"; capacity = 40; status = "ACTIVE"; description = "Modern computer lab with 40 workstations and dual monitors" },
    @{ name = "Chemistry Lab 201"; type = "LAB"; location = "Science Block, Floor 2"; capacity = 30; status = "ACTIVE"; description = "Chemistry laboratory with fume hoods and safety equipment" },
    @{ name = "Conference Room B2"; type = "MEETING_ROOM"; location = "Building B, Floor 2"; capacity = 20; status = "ACTIVE"; description = "Executive conference room with video conferencing setup" },
    @{ name = "Seminar Room C1"; type = "MEETING_ROOM"; location = "Building C, Floor 1"; capacity = 35; status = "ACTIVE"; description = "Seminar room with tiered seating and presentation equipment" },
    @{ name = "Lecture Hall B1"; type = "LECTURE_HALL"; location = "Building B, Floor 1"; capacity = 150; status = "ACTIVE"; description = "Medium-sized lecture hall with smart board" },
    @{ name = "Physics Lab 301"; type = "LAB"; location = "Science Block, Floor 3"; capacity = 25; status = "OUT_OF_SERVICE"; description = "Physics lab under renovation for new optical equipment" },
    @{ name = "Projector Set A"; type = "EQUIPMENT"; location = "AV Room, Building A"; capacity = 1; status = "ACTIVE"; description = "Portable projector with screen and speaker system" }
)

$createdResources = @()
foreach ($r in $resources) {
    try {
        $res = Invoke-RestMethod -Uri "$API/resources" -Method POST -Headers $headers -Body ($r | ConvertTo-Json)
        $createdResources += $res
        Write-Host "  + Resource: $($res.name) [$($res.type)] - ID: $($res.id)" -ForegroundColor Green
    } catch {
        Write-Host "  ! Failed: $($r.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== MODULE C: TICKETS ====================
Write-Host "`n[3/5] Creating Tickets..." -ForegroundColor Yellow

$resourceRef1 = if ($createdResources.Count -ge 1) { $createdResources[0].name } else { "Lecture Hall A1" }
$resourceRef2 = if ($createdResources.Count -ge 2) { $createdResources[1].name } else { "Computer Lab 101" }

function New-Ticket($resourceId, $userId, $category, $description, $priority, $contact) {
    $boundary = [System.Guid]::NewGuid().ToString()
    $body = "--$boundary`r`nContent-Disposition: form-data; name=`"resourceId`"`r`n`r`n$resourceId`r`n--$boundary`r`nContent-Disposition: form-data; name=`"userId`"`r`n`r`n$userId`r`n--$boundary`r`nContent-Disposition: form-data; name=`"category`"`r`n`r`n$category`r`n--$boundary`r`nContent-Disposition: form-data; name=`"description`"`r`n`r`n$description`r`n--$boundary`r`nContent-Disposition: form-data; name=`"priority`"`r`n`r`n$priority`r`n--$boundary`r`nContent-Disposition: form-data; name=`"contactDetails`"`r`n`r`n$contact`r`n--$boundary--`r`n"
    try {
        $res = Invoke-RestMethod -Uri "$API/tickets" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        Write-Host "  + Ticket: [$priority] $category - $($res.id)" -ForegroundColor Green
        return $res
    } catch {
        Write-Host "  ! Failed: $category - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

$t1 = New-Ticket $resourceRef1 $user1Id "Electrical" "Flickering lights in the lecture hall ceiling. Multiple fluorescent tubes need replacement." "HIGH" "dineesha@smartcampus.lk"
$t2 = New-Ticket $resourceRef2 $user2Id "IT / Network" "WiFi connectivity drops every 15 minutes in the computer lab." "CRITICAL" "lasitha@smartcampus.lk"
$t3 = New-Ticket "Building A Corridor" $user1Id "Plumbing" "Water leak from ceiling near Room A105. Creating a slip hazard." "HIGH" "0771234567"
$t4 = New-Ticket "Library Study Room 3" $user2Id "Furniture" "Two chairs have broken wheels. One desk has a wobbly leg." "LOW" "lasitha@smartcampus.lk"
$t5 = New-Ticket "Sports Complex" $user1Id "HVAC / AC" "Air conditioning making loud rattling noise." "MEDIUM" "dineesha@smartcampus.lk"
$t6 = New-Ticket "Chemistry Lab 201" $adminId "Safety" "Emergency eyewash station not functioning properly." "CRITICAL" "admin@smartcampus.lk"

# Assign & update statuses
if ($t1 -and $techId) {
    try { Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/assign" -Method PUT -Headers $headers -Body "{`"technicianId`":`"$techId`"}" | Out-Null; Write-Host "  * Assigned tech to $($t1.id)" -ForegroundColor Magenta } catch {}
}
if ($t3) {
    try {
        Invoke-RestMethod -Uri "$API/tickets/$($t3.id)/assign" -Method PUT -Headers $headers -Body "{`"technicianId`":`"$techId`"}" | Out-Null
        Invoke-RestMethod -Uri "$API/tickets/$($t3.id)/status" -Method PUT -Headers $headers -Body '{"status":"RESOLVED","notes":"Fixed the pipe joint. Ceiling tile replaced."}' | Out-Null
        Write-Host "  * Ticket $($t3.id) RESOLVED" -ForegroundColor Magenta
    } catch {}
}

# Add comments
if ($t1) {
    try {
        Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/comments" -Method POST -Headers $headers -Body "{`"ticketId`":`"$($t1.id)`",`"userId`":`"$techId`",`"userName`":`"Tech Support`",`"content`":`"Inspected the lights. Will need 6 replacement tubes. Parts ordered, ETA 2 days.`"}" | Out-Null
        Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/comments" -Method POST -Headers $headers -Body "{`"ticketId`":`"$($t1.id)`",`"userId`":`"$user1Id`",`"userName`":`"Dineesha Perera`",`"content`":`"Thanks for the quick response! Can we get temporary portable lights?`"}" | Out-Null
        Write-Host "  * Added 2 comments to $($t1.id)" -ForegroundColor Magenta
    } catch {}
}

# ==================== MODULE D: NOTIFICATIONS ====================
Write-Host "`n[4/5] Creating Notifications..." -ForegroundColor Yellow

$notifications = @(
    @{ userId = $user1Id; title = "Ticket Assigned"; message = "Your electrical ticket has been assigned to a technician."; type = "TICKET_ASSIGNED"; referenceId = $(if($t1){$t1.id}else{"t1"}) },
    @{ userId = $user1Id; title = "New Comment"; message = "Tech Support commented: Inspected the lights. Parts ordered."; type = "NEW_COMMENT"; referenceId = $(if($t1){$t1.id}else{"t1"}) },
    @{ userId = $user2Id; title = "Booking Approved"; message = "Your booking for Computer Lab 101 on Monday 10 AM has been approved."; type = "BOOKING_APPROVED"; referenceId = "booking1" },
    @{ userId = $user1Id; title = "Visitor Approved"; message = "Your visitor request for Dr. Smith on April 25 has been approved."; type = "VISITOR_APPROVED"; referenceId = "visitor1" },
    @{ userId = $adminId; title = "Critical Ticket"; message = "CRITICAL ticket raised for Chemistry Lab eyewash station."; type = "TICKET_STATUS"; referenceId = $(if($t6){$t6.id}else{"t6"}) },
    @{ userId = $user1Id; title = "System Update"; message = "Smart Campus Hub maintenance on Sunday 2-4 AM."; type = "GENERAL"; referenceId = "" }
)

foreach ($n in $notifications) {
    try {
        Invoke-RestMethod -Uri "$API/notifications" -Method POST -Headers $headers -Body ($n | ConvertTo-Json) | Out-Null
        Write-Host "  + Notification: $($n.title)" -ForegroundColor Green
    } catch {
        Write-Host "  ! Failed: $($n.title)" -ForegroundColor Red
    }
}

# ==================== MODULE F: VISITOR REQUESTS ====================
# Fields: visitorName, nicOrPassport, hostPerson, hostDepartment, purpose, visitDate (LocalDate), visitTime (LocalTime), location, numberOfVisitors
Write-Host "`n[5/5] Creating Visitor Requests..." -ForegroundColor Yellow

$visitors = @(
    @{ visitorName = "Dr. Amal Jayawardena"; nicOrPassport = "199012345678"; hostPerson = "Prof. Kamal Perera"; hostDepartment = "Computer Science"; purpose = "Guest Lecture on Machine Learning"; visitDate = "2026-04-25"; visitTime = "10:00:00"; location = "Lecture Hall A1"; numberOfVisitors = 1; createdBy = $user1Id },
    @{ visitorName = "Samitha Holdings Ltd."; nicOrPassport = "PV00123456"; hostPerson = "Admin User"; hostDepartment = "Administration"; purpose = "Campus Infrastructure Audit"; visitDate = "2026-04-28"; visitTime = "09:00:00"; location = "Building A"; numberOfVisitors = 3; createdBy = $adminId },
    @{ visitorName = "Sarah Thompson"; nicOrPassport = "N12345678"; hostPerson = "Lasitha Fernando"; hostDepartment = "Career Guidance"; purpose = "Alumni Career Talk"; visitDate = "2026-04-30"; visitTime = "14:00:00"; location = "Conference Room B2"; numberOfVisitors = 1; createdBy = $user2Id },
    @{ visitorName = "TechCorp Recruiters"; nicOrPassport = "PV00789012"; hostPerson = "Admin User"; hostDepartment = "Career Guidance"; purpose = "Campus Recruitment Drive"; visitDate = "2026-05-02"; visitTime = "09:30:00"; location = "Conference Room B2"; numberOfVisitors = 5; createdBy = $adminId },
    @{ visitorName = "Prof. Kumar Patel"; nicOrPassport = "PP98765432"; hostPerson = "Dineesha Perera"; hostDepartment = "Research"; purpose = "IoT Research Collaboration"; visitDate = "2026-05-05"; visitTime = "11:00:00"; location = "Meeting Room C1"; numberOfVisitors = 2; createdBy = $user1Id }
)

$createdVisitors = @()
foreach ($v in $visitors) {
    try {
        $res = Invoke-RestMethod -Uri "$API/visitor-requests" -Method POST -Headers $headers -Body ($v | ConvertTo-Json)
        $createdVisitors += $res
        Write-Host "  + Visitor: $($v.visitorName) - $($v.purpose)" -ForegroundColor Green
    } catch {
        Write-Host "  ! Failed: $($v.visitorName) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Approve/reject some
if ($createdVisitors.Count -ge 1) {
    try { Invoke-RestMethod -Uri "$API/visitor-requests/$($createdVisitors[0].id)/approve" -Method PUT | Out-Null; Write-Host "  * Approved: $($createdVisitors[0].visitorName)" -ForegroundColor Magenta } catch {}
}
if ($createdVisitors.Count -ge 2) {
    try { Invoke-RestMethod -Uri "$API/visitor-requests/$($createdVisitors[1].id)/approve" -Method PUT | Out-Null; Write-Host "  * Approved: $($createdVisitors[1].visitorName)" -ForegroundColor Magenta } catch {}
}
if ($createdVisitors.Count -ge 4) {
    try { Invoke-RestMethod -Uri "$API/visitor-requests/$($createdVisitors[3].id)/reject" -Method PUT -Headers $headers -Body '{"reason":"Conference room not available on requested date"}' | Out-Null; Write-Host "  * Rejected: $($createdVisitors[3].visitorName)" -ForegroundColor Magenta } catch {}
}

Write-Host "`n===== Seeding Complete! =====" -ForegroundColor Cyan
Write-Host "  Users: $($createdUsers.Count) | Resources: $($createdResources.Count) | Tickets: 6 | Notifications: $($notifications.Count) | Visitors: $($createdVisitors.Count)" -ForegroundColor White
Write-Host "`nLogin:" -ForegroundColor Yellow
Write-Host "  Admin:      admin@smartcampus.lk / admin123" -ForegroundColor White
Write-Host "  User:       dineesha@smartcampus.lk / pass123" -ForegroundColor White
Write-Host "  Technician: tech@smartcampus.lk / pass123" -ForegroundColor White
Write-Host "  Security:   security@smartcampus.lk / pass123" -ForegroundColor White
