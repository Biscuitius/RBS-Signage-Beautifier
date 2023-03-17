// Gather relevant data from the original page
const title = getTitle();
const headers = getHeaders();
const timeslots = getTimeslots();
const bookings = getBookings();

// Scrap the original page and replace with new template
fetch(chrome.runtime.getURL("main.html"))
    .then(newHTML => newHTML.text())
    .then(newHTML => document.querySelector("html").innerHTML = newHTML)
    .then(() => fillTemplate());

function getTitle() {
    const originalTitle = document.body.querySelector(
        "body > div.greydark.largest > b");
    return ("Booking System - " + originalTitle.innerText);
};

function getHeaders() {
    const originalHeaders = document.body.querySelectorAll(
        "#timetableHeader > div.timetableHeaderItem");
    let newHeaders = [];
    originalHeaders.forEach((oldHeader) => {
        if (!oldHeader.innerHTML.includes("Not Bookable")) {
            let split = oldHeader.innerHTML.split("&nbsp;");
            const day = split[0];
            split = split[1].split("<br>");
            const date = split[0];
            const isBookable = split[1];
            switch (oldHeader.innerHTML.split("&nbsp;")[0]) {
                case "Mon": newHeaders.push("Monday"); break;
                case "Tue": newHeaders.push("Tuesday"); break;
                case "Wed": newHeaders.push("Wednesday"); break;
                case "Thu": newHeaders.push("Thursday"); break;
                case "Fri": newHeaders.push("Friday"); break;
                case "Sat": newHeaders.push("Saturday"); break;
                case "Sun": newHeaders.push("Sunday"); break;
            };
        };
    });
    return (newHeaders);
};

function getTimeslots() {
    const originalTimeslots = document.body.querySelectorAll(
        "#timetableTimeslots > div.timetableTimeslotRow > div.timetableTimeslotName");
    return (originalTimeslots);
};

function getBookings() {

    // Get the original bookings
    const originalBookings = document.body.querySelectorAll(
        "#timetableGrid > div[id*=\"cell\"]")

    // Convert the bookings to a more useable format
    let newBookings = [];
    originalBookings.forEach((slot) => {

        // Check if the slot is under a day where bookings are disabled
        if (!(slot.attributes.onClick &&
            slot.attributes.onclick.value.includes("alert"))
        ) {
            console.log(slot.innerText);
            // Check if slot contains bookings
            if (slot.firstChild.title) {

                // If there are bookings, convert & store them
                let bookingSlot = [];
                const bookingList = slot.firstChild.title.split("\n");
                bookingList.forEach((booking) => {
                    const split = booking.split(" booked by ");
                    const quantity = split[0];
                    const name = split[1];
                    bookingSlot.push({ "name": name, "quantity": quantity });
                });
                newBookings.push(bookingSlot);

            } else newBookings.push(null); // Otherwise give the slot a null value
        };
    });
    return (newBookings);
};

function fillTemplate() {

    // Add the table's title to the head & body
    document.head.insertAdjacentHTML("afterbegin", `<title>${title}</title>`);
    document.body.insertAdjacentHTML("afterbegin", `<header>${title}</header>`);

    // Add the table's horizontal (top) headers (days)
    const headerRow = document.querySelector("body > table > thead > tr");
    headers.forEach(header => {
        headerRow.insertAdjacentHTML("beforeend", `<th>${header}</th>`);
    });

    // Add the table's vertical (side) headers (timeslots)
    const tableBody = document.querySelector("body > table > tbody");
    timeslots.forEach(timeslot => {
        tableBody.insertAdjacentHTML(
            "beforeend", `<tr><th>${timeslot.innerText}</th></tr>`);
    });

    const tableRows = document.querySelectorAll("body > table > tbody > tr");
    let rowIndex = 0;

    bookings.forEach(slot => {

        const cell = document.createElement("td");
        const container = document.createElement("div");
        container.setAttribute("class", "booking-slot");

        if (slot) {
            slot.forEach(booking => {
                // const color = stringToColour(booking.name);
                // container.insertAdjacentHTML("beforeend",
                //     `<p style="background-color: ${color}">
                //     ${booking.name}: ${booking.quantity}</p>`)
                container.insertAdjacentHTML("beforeend",
                    `<p>${booking.name}: ${booking.quantity}</p>`)
            });
        } else {
            container.setAttribute("class", "booking-slot empty");
            container.insertAdjacentHTML("afterbegin", "<p>No Bookings</p>");
        };
        cell.insertAdjacentElement('beforeend', container);
        tableRows[rowIndex].insertAdjacentElement("beforeend", cell);
        rowIndex++;
        if (rowIndex >= timeslots.length) rowIndex = 0;
    });
};

// function stringToColour(string) {
//     let hash = 0;
//     for (let i = 0; i < string.length; i++) {
//         hash = string.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     let colour = '#';
//     for (let i = 0; i < 3; i++) {
//         const value = (hash >> (i * 8)) & 0xFF;
//         colour += ('00' + value.toString(16)).substr(-2);
//     }
//     return colour;
// };