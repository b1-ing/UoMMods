export async function sendForAuthentication(redirectUrl: string):  Promise<{
    auth: boolean;
    url: string;
    fullname: string | null;
    username: string | null;
}>  {
    const csticket = Date.now().toString(16);
    document.cookie = `csticket=${csticket}; path=/`;
    console.log(redirectUrl);
    const url = `${process.env.NEXT_PUBLIC_AUTHENTICATION_SERVICE_URL}?url=${encodeURIComponent(redirectUrl)}&csticket=${csticket}&version=3&command=validate`;

    window.location.href = url;
    return {
        auth: false,
        url,
        fullname: null,
        username: null,
    };
}


export async function confirmAuthentication(csticket: string, username: string, fullname: string): Promise<boolean> {
    const confirmUrl = `${process.env.NEXT_PUBLIC_AUTHENTICATION_SERVICE_URL}?url=${process.env.NEXT_PUBLIC_APP_HOME_URL}&csticket=${csticket}&version=3&command=confirm&username=${encodeURIComponent(username)}&fullname=${encodeURIComponent(fullname)}`;
    const res = await fetch(confirmUrl, { credentials: 'include' });
    return (await res.text()) === 'true';
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

export async function validateUser(redirectUrl: string): Promise<{
    auth: boolean;
    url: string;
    fullname: string | null;
    username: string | null;
}> {
    const csticket = getCookie("csticket");
    const urlParams = new URLSearchParams(window.location.search);
    const returnedTicket = urlParams.get("csticket");
    const fullname = urlParams.get("fullname");
    const username = urlParams.get("username");

    const APP_HOME_URL = process.env.NEXT_PUBLIC_APP_HOME_URL!;

    const isAlreadyAuthenticated = localStorage.getItem("authenticated") === "true" &&
        localStorage.getItem("fullname") === fullname &&
        localStorage.getItem("username") === username;

    if (isAlreadyAuthenticated) {
        return {
            auth: true,
            url: APP_HOME_URL,
            fullname: localStorage.getItem("fullname"),
            username: localStorage.getItem("username"),
        };
    }

    // Missing or mismatched ticket
    if (!csticket || !returnedTicket || csticket !== returnedTicket) {
        return await sendForAuthentication(APP_HOME_URL);
    }

    // Confirm with authentication service
    const confirmed = await confirmAuthentication(csticket, username!, fullname!);
    if (confirmed) {
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("fullname", fullname!);
        localStorage.setItem("username", username!);

        return {
            auth: true,
            url: APP_HOME_URL,
            fullname,
            username,
        };
    } else {
        return {
            auth: false,
            url: APP_HOME_URL + "/failed-auth",
            fullname: null,
            username: null,
        };
    }
}


