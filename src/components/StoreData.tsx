
export const StoreData = (jwt : any, userData : any ) => {
    sessionStorage.setItem("AuthToken", jwt);
    sessionStorage.setItem("UserData", JSON.stringify(userData));
    
    const now = new Date(); // current time
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000); // add 1 day
    sessionStorage.setItem("TokenExpiry", oneDayLater.toISOString());
}

export const getUserDetails = (type : string) => {
    const userDataStr = sessionStorage.getItem("UserData");
    const user = userDataStr ? JSON.parse(userDataStr) : null;

    if (!user) {
        return null;
    } else if (type == "data") {
        return user;
    } else if (type == "userName"){
        return user.userName;
    } else if (type == "email") {
        return user.email;
    }
}

export const getCsrfToken = () => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return csrfToken;
}
