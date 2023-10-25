// Function to get the value of a specific cookie by its name
const getCookieValue = (name) => {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null; // Return null if the cookie is not found
};

// Function to check if the user is already logged in
const checkLoggedIn = () => {
    const isLoggedInValue = getCookieValue('NightOut_EstablecimientoLogin');
    if (isLoggedInValue === "true") {
        // User is logged in
        console.log("User is logged in.");

        const id = getCookieValue('NightOut_Establecimiento');
        console.log(id)

    } else {
        // User is not logged in
        console.log("User is not logged in.");
        logout();
    }
};

// Function to logout the user
const logout = () => {
    // Remove the "isLoggedIn" cookie by setting its expiration date to the past
    const pastDate = new Date(0).toUTCString();
    document.cookie = `NightOut_EstablecimientoLogin=false; expires=${pastDate}; path=/`;
    document.cookie = `NightOut_Establecimiento=false; expires=${pastDate}; path=/`;

    // Redirect to the login page
    window.location.href = 'login.html';
};

// Example of how to trigger the logout function, e.g., when a "Logout" button is clicked
document.getElementById('logout-button').addEventListener('click', logout);

// Call the checkLoggedIn function when the page loads
window.addEventListener('load', checkLoggedIn);