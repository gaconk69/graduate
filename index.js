
/* =====================================================
   1. DOM ELEMENTS
===================================================== */

const inputScreen = document.getElementById("inputScreen");
const invitationScreen = document.getElementById("invitationScreen");

const nameForm = document.getElementById("nameForm");
const guestNameInput = document.getElementById("guestName");

const displayGuestName = document.getElementById("displayGuestName");

const errorMessage = document.getElementById("errorMessage");

const eventDate = document.getElementById("eventDate");
const eventLocation = document.getElementById("eventLocation");

const timeSlotsContainer = document.getElementById("timeSlots");

const particlesContainer = document.getElementById("particles");


/* =====================================================
   2. APPLICATION STATE
===================================================== */

let guestList = [];

let isDataLoaded = false;

let isOpened = false;


/* =====================================================
   3. NORMALIZE NAME
   Không phân biệt chữ hoa và chữ thường
===================================================== */

function normalizeName(name) {
    return String(name)
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("vi");
}


/* =====================================================
   4. LOAD DATA.JSON
===================================================== */

async function loadGuestData() {
    try {
        const response = await fetch('./data.json');

        if (!response.ok) {
            throw new Error(
                `Không thể tải data.json (HTTP ${response.status}).`
            );
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.guests)) {
            throw new Error(
                "Cấu trúc data.json không hợp lệ. Cần có mảng guests."
            );
        }

        // Chỉ giữ những khách có tên hợp lệ
        guestList = data.guests.filter(guest => {
            return (
                guest &&
                typeof guest.name === "string" &&
                guest.name.trim().length > 0
            );
        });

        if (guestList.length === 0) {
            throw new Error(
                "Danh sách khách mời hiện đang trống."
            );
        }

        isDataLoaded = true;

        console.log(
            `Đã tải thành công ${guestList.length} khách mời.`
        );

        console.log("Danh sách khách:", guestList);

        clearError();

    } catch (error) {
        isDataLoaded = false;

        console.error("Lỗi tải dữ liệu:", error);

        showError(
            "Không thể tải danh sách khách mời. " +
            "Vui lòng kiểm tra data.json và Live Server."
        );
    }
}


/* =====================================================
   5. FIND GUEST
===================================================== */

function findGuest(inputName) {

    const normalizedInput = normalizeName(inputName);

    return guestList.find(guest => {
        return normalizeName(guest.name) === normalizedInput;
    });
}


/* =====================================================
   6. SHOW ERROR
===================================================== */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("shake");

    // Khởi động lại animation
    void errorMessage.offsetWidth;

    errorMessage.classList.add("shake");
}


/* =====================================================
   7. CLEAR ERROR
===================================================== */

function clearError() {

    errorMessage.textContent = "";

    errorMessage.classList.remove("shake");
}


/* =====================================================
   8. RENDER TIME SLOTS
===================================================== */

function renderTimeSlots(timeSlots) {

    // Xóa lịch trình cũ
    timeSlotsContainer.innerHTML = "";

    // Kiểm tra dữ liệu
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-schedule";

        emptyMessage.textContent = "Thông tin lịch trình đang được cập nhật.";

        timeSlotsContainer.appendChild(emptyMessage);

        return;
    }

    // Tạo từng khung giờ
    timeSlots.forEach((slot, index) => {

        const slotElement = document.createElement("div");

        slotElement.className = "time-slot";

        // Số thứ tự
        const numberElement = document.createElement("span");

        numberElement.className = "time-slot-number";

        numberElement.textContent = String(index + 1).padStart(2, "0");

        // Nội dung
        const contentElement = document.createElement("div");

        contentElement.className = "time-slot-content";

        // Nhãn khung giờ
        const labelElement = document.createElement("span");

        labelElement.className = "time-slot-label";

        labelElement.textContent = `KHUNG GIỜ ${index + 1}`;

        // Giá trị thời gian
        const valueElement = document.createElement("span");

        valueElement.className = "time-slot-value";

        valueElement.textContent = String(slot);

        // Ghép các thành phần
        contentElement.appendChild(labelElement);

        contentElement.appendChild(valueElement);

        slotElement.appendChild(numberElement);

        slotElement.appendChild(contentElement);

        // Hiệu ứng xuất hiện lần lượt
        slotElement.style.animationDelay = `${index * 0.12}s`;

        timeSlotsContainer.appendChild(slotElement);
    });
}


/* =====================================================
   9. DISPLAY GUEST INFORMATION
===================================================== */

function displayGuestInformation(guest) {

    // Tên khách mời
    displayGuestName.textContent = guest.name;

    // Ngày tổ chức
    eventDate.textContent = guest.date || "Đang cập nhật";

    // Địa điểm
    eventLocation.textContent = guest.location || "Đang cập nhật";

    // Danh sách khung giờ
    renderTimeSlots(guest.timeSlots);
}


/* =====================================================
   10. OPEN INVITATION
===================================================== */

function openInvitation(guest) {

    if (isOpened) return;

    isOpened = true;

    // Hiển thị thông tin
    displayGuestInformation(guest);

    // Chuyển màn hình
    inputScreen.classList.remove("active");

    invitationScreen.classList.add("active");

    // Đưa màn hình về đầu trang
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =====================================================
   11. HANDLE FORM SUBMISSION
===================================================== */

nameForm.addEventListener("submit", function(event) {

    event.preventDefault();

    clearError();

    const inputName = guestNameInput.value;

    // Kiểm tra tên trống
    if (!inputName.trim()) {

        showError("Vui lòng nhập họ và tên của bạn.");

        guestNameInput.focus();

        return;
    }

    // Kiểm tra dữ liệu đã tải chưa
    if (!isDataLoaded) {

        showError(
            "Danh sách khách mời chưa sẵn sàng. Vui lòng tải lại trang."
        );

        return;
    }

    // Tìm khách mời
    const guest = findGuest(inputName);

    if (!guest) {

        showError(
            "Rất tiếc, không tìm thấy tên trong danh sách khách mời."
        );

        guestNameInput.focus();

        return;
    }

    // Mở thiệp
    openInvitation(guest);

});


/* =====================================================
   12. CLEAR ERROR WHEN TYPING
===================================================== */

guestNameInput.addEventListener("input", function() {
    clearError();
});


/* =====================================================
   13. BACKGROUND PARTICLES
===================================================== */

function createParticles() {

    if (!particlesContainer) return;

    const particleCount = window.innerWidth < 768 ? 18 : 35;

    particlesContainer.innerHTML = "";

    for (let i = 0; i < particleCount; i++) {

        const particle = document.createElement("span");

        const size = Math.random() * 3 + 1;

        const duration = Math.random() * 10 + 8;

        const delay = Math.random() * 10;

        particle.style.position = "absolute";

        particle.style.left = `${Math.random() * 100}%`;

        particle.style.top = `${Math.random() * 100}%`;

        particle.style.width = `${size}px`;

        particle.style.height = `${size}px`;

        particle.style.borderRadius = "50%";

        particle.style.background = "#e7d09d";

        particle.style.opacity = "0";

        particle.style.boxShadow =
            "0 0 10px rgba(231, 208, 157, 0.8)";

        particle.style.animation =
            `particleFloat ${duration}s ${delay}s ease-in-out infinite`;

        particlesContainer.appendChild(particle);
    }
}


/* =====================================================
   14. PARTICLE ANIMATION
===================================================== */

const particleStyle = document.createElement("style");

particleStyle.textContent = `
    @keyframes particleFloat {

        0% {
            transform: translateY(30px) scale(0.5);
            opacity: 0;
        }

        20% {
            opacity: 0.7;
        }

        50% {
            transform: translateY(-50px) scale(1);
            opacity: 0.5;
        }

        80% {
            opacity: 0.6;
        }

        100% {
            transform: translateY(-120px) scale(0.4);
            opacity: 0;
        }
    }

    .empty-schedule {
        padding: 18px;
        color: #a7b0c0;
        font-size: 12px;
        text-align: center;
        border: 1px dashed rgba(216, 189, 131, 0.25);
    }
`;

document.head.appendChild(particleStyle);


/* =====================================================
   15. INITIALIZE APPLICATION
===================================================== */

async function initializeApp() {

    createParticles();

    await loadGuestData();

    console.log("Graduation Invitation initialized.");
}


/* =====================================================
   16. START APPLICATION
===================================================== */

document.addEventListener("DOMContentLoaded", function() {

    initializeApp();

});
