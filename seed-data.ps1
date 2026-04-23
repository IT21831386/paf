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
    # Make first user admin
    try {
        Invoke-RestMethod -Uri "$API/auth/users/$($createdUsers[0].id)/role" -Method PUT -Headers $headers -Body '{"role":"ADMIN"}' | Out-Null
        Write-Host "  * Set $($createdUsers[0].name) as ADMIN" -ForegroundColor Magenta
    } catch {}
}
if ($createdUsers.Count -ge 6) {
    # Make tech user a technician
    try {
        Invoke-RestMethod -Uri "$API/auth/users/$($createdUsers[5].id)/role" -Method PUT -Headers $headers -Body '{"role":"TECHNICIAN"}' | Out-Null
        Write-Host "  * Set $($createdUsers[5].name) as TECHNICIAN" -ForegroundColor Magenta
    } catch {}
}
if ($createdUsers.Count -ge 7) {
    # Make security user security role
    try {
        Invoke-RestMethod -Uri "$API/auth/users/$($createdUsers[6].id)/role" -Method PUT -Headers $headers -Body '{"role":"SECURITY"}' | Out-Null
        Write-Host "  * Set $($createdUsers[6].name) as SECURITY" -ForegroundColor Magenta
    } catch {}
}

# Get user IDs for later use
$adminId = if ($createdUsers.Count -ge 1) { $createdUsers[0].id } else { "user1" }
$user1Id = if ($createdUsers.Count -ge 2) { $createdUsers[1].id } else { "user2" }
$user2Id = if ($createdUsers.Count -ge 3) { $createdUsers[2].id } else { "user3" }
$techId  = if ($createdUsers.Count -ge 6) { $createdUsers[5].id } else { "tech1" }

# ==================== MODULE A: RESOURCES ====================
Write-Host "`n[2/5] Creating Resources..." -ForegroundColor Yellow

$resources = @(
    @{ name = "Lecture Hall A1"; type = "LECTURE_HALL"; location = "Building A, Floor 1"; capacity = 200; status = "AVAILABLE"; description = "Large lecture hall with AV equipment and air conditioning" },
    @{ name = "Computer Lab 101"; type = "LAB"; location = "Building B, Floor 1"; capacity = 40; status = "AVAILABLE"; description = "Modern computer lab with 40 workstations and dual monitors" },
    @{ name = "Library Study Room 3"; type = "STUDY_ROOM"; location = "Main Library, Floor 3"; capacity = 8; status = "AVAILABLE"; description = "Quiet study room with whiteboard and projector" },
    @{ name = "Sports Complex Gym"; type = "GYM"; location = "Sports Complex, Ground Floor"; capacity = 50; status = "AVAILABLE"; description = "Fully equipped gymnasium with modern fitness equipment" },
    @{ name = "Conference Room B2"; type = "CONFERENCE_ROOM"; location = "Building B, Floor 2"; capacity = 20; status = "AVAILABLE"; description = "Executive conference room with video conferencing setup" },
    @{ name = "Auditorium"; type = "AUDITORIUM"; location = "Main Building, Ground Floor"; capacity = 500; status = "UNDER_MAINTENANCE"; description = "Main campus auditorium for events and ceremonies" },
    @{ name = "Chemistry Lab 201"; type = "LAB"; location = "Science Block, Floor 2"; capacity = 30; status = "AVAILABLE"; description = "Chemistry laboratory with fume hoods and safety equipment" },
    @{ name = "Seminar Room C1"; type = "SEMINAR_ROOM"; location = "Building C, Floor 1"; capacity = 35; status = "AVAILABLE"; description = "Seminar room with tiered seating and presentation equipment" }
)

$createdResources = @()
foreach ($r in $resources) {
    try {
        $res = Invoke-RestMethod -Uri "$API/resources" -Method POST -Headers $headers -Body ($r | ConvertTo-Json)
        $createdResources += $res
        Write-Host "  + Resource: $($res.name) - ID: $($res.id)" -ForegroundColor Green
    } catch {
        Write-Host "  ! Failed: $($r.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==================== MODULE C: TICKETS ====================
Write-Host "`n[3/5] Creating Tickets..." -ForegroundColor Yellow

$resourceRef1 = if ($createdResources.Count -ge 1) { $createdResources[0].name } else { "Lecture Hall A1" }
$resourceRef2 = if ($createdResources.Count -ge 2) { $createdResources[1].name } else { "Computer Lab 101" }

# Using multipart form for ticket creation
function New-Ticket($resourceId, $userId, $category, $description, $priority, $contact) {
    $boundary = [System.Guid]::NewGuid().ToString()
    $body = @"
--$boundary
Content-Disposition: form-data; name="resourceId"

$resourceId
--$boundary
Content-Disposition: form-data; name="userId"

$userId
--$boundary
Content-Disposition: form-data; name="category"

$category
--$boundary
Content-Disposition: form-data; name="description"

$description
--$boundary
Content-Disposition: form-data; name="priority"

$priority
--$boundary
Content-Disposition: form-data; name="contactDetails"

$contact
--$boundary--
"@
    try {
        $res = Invoke-RestMethod -Uri "$API/tickets" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        Write-Host "  + Ticket: [$priority] $category - $($res.id)" -ForegroundColor Green
        return $res
    } catch {
        Write-Host "  ! Failed: $category - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

$t1 = New-Ticket $resourceRef1 $user1Id "Electrical" "Flickering lights in the lecture hall ceiling. Multiple fluorescent tubes need replacement. The issue affects the front 3 rows." "HIGH" "dineesha@smartcampus.lk"
$t2 = New-Ticket $resourceRef2 $user2Id "IT / Network" "WiFi connectivity drops every 15 minutes in the computer lab. Students unable to complete online assignments." "CRITICAL" "lasitha@smartcampus.lk"
$t3 = New-Ticket "Building A Corridor" $user1Id "Plumbing" "Water leak from ceiling near Room A105. Water is pooling on the floor creating a slip hazard." "HIGH" "0771234567"
$t4 = New-Ticket "Library Study Room 3" $user2Id "Furniture" "Two chairs in study room have broken wheels. One desk has a wobbly leg that needs fixing." "LOW" "lasitha@smartcampus.lk"
$t5 = New-Ticket "Sports Complex" $user1Id "HVAC / AC" "Air conditioning unit making loud rattling noise. Temperature not maintaining set level." "MEDIUM" "dineesha@smartcampus.lk"
$t6 = New-Ticket "Chemistry Lab 201" $adminId "Safety" "Emergency eyewash station not functioning properly. Water pressure is too low for effective use." "CRITICAL" "admin@smartcampus.lk"

# Assign technician and update statuses on some tickets
if ($t1 -and $techId) {
    try {
        Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/assign" -Method PUT -Headers $headers -Body "{`"technicianId`":`"$techId`"}" | Out-Null
        Write-Host "  * Assigned technician to ticket $($t1.id)" -ForegroundColor Magenta
    } catch {}
}

if ($t3) {
    try {
        Invoke-RestMethod -Uri "$API/tickets/$($t3.id)/assign" -Method PUT -Headers $headers -Body "{`"technicianId`":`"$techId`"}" | Out-Null
        Invoke-RestMethod -Uri "$API/tickets/$($t3.id)/status" -Method PUT -Headers $headers -Body '{"status":"RESOLVED","notes":"Fixed the pipe joint causing the leak. Ceiling tile replaced."}' | Out-Null
        Write-Host "  * Ticket $($t3.id) marked as RESOLVED" -ForegroundColor Magenta
    } catch {}
}

# Add comments to tickets
if ($t1) {
    try {
        Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/comments" -Method POST -Headers $headers -Body "{`"ticketId`":`"$($t1.id)`",`"userId`":`"$techId`",`"userName`":`"Tech Support`",`"content`":`"Inspected the lights. Will need 6 replacement tubes. Parts ordered, ETA 2 days.`"}" | Out-Null
        Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/comments" -Method POST -Headers $headers -Body "{`"ticketId`":`"$($t1.id)`",`"userId`":`"$user1Id`",`"userName`":`"Dineesha Perera`",`"content`":`"Thanks for the quick response! Is it possible to get temporary portable lights in the meantime?`"}" | Out-Null
        Invoke-RestMethod -Uri "$API/tickets/$($t1.id)/comments" -Method POST -Headers $headers -Body "{`"ticketId`":`"$($t1.id)`",`"userId`":`"$techId`",`"userName`":`"Tech Support`",`"content`":`"Yes, I will arrange 2 portable LED lights for the affected area by tomorrow morning.`"}" | Out-Null
        Write-Host "  * Added 3 comments to ticket $($t1.id)" -ForegroundColor Magenta
    } catch {}
}

if ($t2) {
    try {
        Invoke-RestMethod -Uri "$API/tickets/$($t2.id)/comments" -Method POST -Headers $headers -Body "{`"ticketId`":`"$($t2.id)`",`"userId`":`"$adminId`",`"userName`":`"Admin User`",`"content`":`"This is a high priority issue. IT team has been notified. Please check router firmware.`"}" | Out-Null
        Write-Host "  * Added 1 comment to ticket $($t2.id)" -ForegroundColor Magenta
    } catch {}
}

# ==================== MODULE D: NOTIFICATIONS ====================
Write-Host "`n[4/5] Creating Notifications..." -ForegroundColor Yellow

$notifications = @(
    @{ userId = $user1Id; title = "Ticket Assigned"; message = "Your ticket for Electrical issue in Lecture Hall A1 has been assigned to a technician."; type = "TICKET_ASSIGNED"; referenceId = $(if($t1){$t1.id}else{"t1"}) },
    @{ userId = $user1Id; title = "New Comment"; message = "Tech Support commented on your ticket: Inspected the lights. Parts ordered."; type = "NEW_COMMENT"; referenceId = $(if($t1){$t1.id}else{"t1"}) },
    @{ userId = $user2Id; title = "Booking Approved"; message = "Your booking for Computer Lab 101 on Monday 10:00 AM has been approved."; type = "BOOKING_APPROVED"; referenceId = "booking1" },
    @{ userId = $user1Id; title = "Visitor Approved"; message = "Your visitor request for Dr. Smith on April 25 has been approved."; type = "VISITOR_APPROVED"; referenceId = "visitor1" },
    @{ userId = $adminId; title = "Critical Ticket"; message = "A CRITICAL priority ticket has been raised for the Chemistry Lab emergency eyewash station."; type = "TICKET_STATUS"; referenceId = $(if($t6){$t6.id}else{"t6"}) },
    @{ userId = $user2Id; title = "Ticket Resolved"; message = "The plumbing issue in Building A Corridor has been resolved."; type = "TICKET_STATUS"; referenceId = $(if($t3){$t3.id}else{"t3"}) },
    @{ userId = $user1Id; title = "System Update"; message = "Smart Campus Hub will undergo maintenance on Sunday 2:00 AM - 4:00 AM."; type = "GENERAL"; referenceId = "" },
    @{ userId = $user2Id; title = "Visitor Rejected"; message = "Your visitor request for a group of 50 was rejected due to capacity limits."; type = "VISITOR_REJECTED"; referenceId = "visitor2" }
)

foreach ($n in $notifications) {
    try {
        Invoke-RestMethod -Uri "$API/notifications" -Method POST -Headers $headers -Body ($n | ConvertTo-Json) | Out-Null
        Write-Host "  + Notification: $($n.title) -> $($n.userId.Substring(0, [Math]::Min(8, $n.userId.Length)))..." -ForegroundColor Green
    } catch {
        Write-Host "  ! Failed: $($n.title)" -ForegroundColor Red
    }
}

# ==================== MODULE F: VISITOR REQUESTS ====================
Write-Host "`n[5/5] Creating Visitor Requests..." -ForegroundColor Yellow

$visitors = @(
    @{ visitorName = "Dr. Amal Jayawardena"; visitorEmail = "amal.j@email.com"; visitorPhone = "0771234567"; purpose = "Guest Lecture on Machine Learning"; visitDate = "2026-04-25"; visitTime = "10:00"; department = "Computer Science"; hostName = "Prof. Kamal Perera"; hostEmail = "kamal@smartcampus.lk"; numberOfVisitors = 1; userId = $user1Id; vehicleNumber = "CAA-1234"; notes = "Will need access to Lecture Hall A1 and parking" },
    @{ visitorName = "Samitha Holdings Ltd."; visitorEmail = "info@samitha.lk"; visitorPhone = "0112345678"; purpose = "Campus Infrastructure Audit"; visitDate = "2026-04-28"; visitTime = "09:00"; department = "Administration"; hostName = "Admin User"; hostEmail = "admin@smartcampus.lk"; numberOfVisitors = 3; userId = $adminId; vehicleNumber = "KP-5678"; notes = "Team of 3 engineers for annual safety inspection" },
    @{ visitorName = "Sarah Thompson"; visitorEmail = "sarah.t@alumni.edu"; visitorPhone = "0779876543"; purpose = "Alumni Career Talk"; visitDate = "2026-04-30"; visitTime = "14:00"; department = "Career Guidance"; hostName = "Lasitha Fernando"; hostEmail = "lasitha@smartcampus.lk"; numberOfVisitors = 1; userId = $user2Id; vehicleNumber = ""; notes = "Will be speaking to final year students about industry careers" },
    @{ visitorName = "TechCorp Recruiters"; visitorEmail = "hr@techcorp.com"; visitorPhone = "0112223344"; purpose = "Campus Recruitment Drive"; visitDate = "2026-05-02"; visitTime = "09:30"; department = "Career Guidance"; hostName = "Admin User"; hostEmail = "admin@smartcampus.lk"; numberOfVisitors = 5; userId = $adminId; vehicleNumber = "WP-CAB-9999"; notes = "Need Conference Room B2 for interviews. 5 interviewers arriving." },
    @{ visitorName = "Prof. Kumar Patel"; visitorEmail = "kumar@iit.edu"; visitorPhone = "0094112334455"; purpose = "Research Collaboration Meeting"; visitDate = "2026-05-05"; visitTime = "11:00"; department = "Research"; hostName = "Dineesha Perera"; hostEmail = "dineesha@smartcampus.lk"; numberOfVisitors = 2; userId = $user1Id; vehicleNumber = ""; notes = "Visiting professor from IIT for IoT research collaboration" }
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

# Approve some visitor requests
if ($createdVisitors.Count -ge 1) {
    try {
        Invoke-RestMethod -Uri "$API/visitor-requests/$($createdVisitors[0].id)/approve" -Method PUT | Out-Null
        Write-Host "  * Approved: $($createdVisitors[0].visitorName)" -ForegroundColor Magenta
    } catch {}
}
if ($createdVisitors.Count -ge 2) {
    try {
        Invoke-RestMethod -Uri "$API/visitor-requests/$($createdVisitors[1].id)/approve" -Method PUT | Out-Null
        Write-Host "  * Approved: $($createdVisitors[1].visitorName)" -ForegroundColor Magenta
    } catch {}
}
if ($createdVisitors.Count -ge 4) {
    try {
        Invoke-RestMethod -Uri "$API/visitor-requests/$($createdVisitors[3].id)/reject" -Method PUT -Headers $headers -Body '{"reason":"Conference room not available on requested date"}' | Out-Null
        Write-Host "  * Rejected: $($createdVisitors[3].visitorName)" -ForegroundColor Magenta
    } catch {}
}

Write-Host "`n===== Seeding Complete! =====" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor White
Write-Host "  Users:         $($createdUsers.Count)" -ForegroundColor White
Write-Host "  Resources:     $($createdResources.Count)" -ForegroundColor White
Write-Host "  Tickets:       6 (with comments + status updates)" -ForegroundColor White
Write-Host "  Notifications: $($notifications.Count)" -ForegroundColor White
Write-Host "  Visitors:      $($createdVisitors.Count)" -ForegroundColor White
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Admin:      admin@smartcampus.lk / admin123" -ForegroundColor White
Write-Host "  User:       dineesha@smartcampus.lk / pass123" -ForegroundColor White
Write-Host "  Technician: tech@smartcampus.lk / pass123" -ForegroundColor White
Write-Host "  Security:   security@smartcampus.lk / pass123" -ForegroundColor White
