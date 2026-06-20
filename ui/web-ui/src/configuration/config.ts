const baseURL: string = import.meta.env?.VITE_BASE_URL || "http://localhost:8080";

// landing repsonse
// const response = await fetch(baseURL+"/api/home-route");
const landingURLService: string = baseURL + "/api/home-route";


// admin reports
const listReportsService: string = baseURL + "/api/admin/reports";
const updateReportsService = (id: number): string => `${baseURL}/api/admin/reports/${id}`; 
const removeReportsService = (id: number): string => `${baseURL}/api/admin/posts/${id}`;
const banUserService = (username: string): string => `${baseURL}/api/admin/users/${username}/`; 


// block services
const blockServices: string = baseURL + "/api/blocks";
const unblockUsernameService = (username: string): string => `${blockServices} ${username}`

// bookings
const bookingService: string = "api/bookings";
const requestBookingService: string = bookingService + "/request";
const acceptRequestService = (id: number) => `${bookingService}/${id}/accept`;
const declineRequestService = (id: number) => `${bookingService}/${id}/decline`
const cancleRequestService = (id: number) => `${bookingService}/${id}/cancel`
const completeRequestService = (id: number) => `${bookingService}/${id}/complete`
const mineRequestService: string = bookingService + "/mine";
const incomingRequestService: string = bookingService + "/incoming";

// forgot password
const forgotPassword: string = baseURL + "/forgot-password";
const resetPassword: string = baseURL + "/reset-password";

// login services
const loginServices: string = baseURL + "/login-user";


// legal services
const legalService: string = baseURL + "/api/legal";
const termService: string = legalService + "/terms";
const privacyService:string = legalService + "/privacy";

// home feed
const homeServiceFeed: string = baseURL + "api/feed";
const createPostService: string = homeServiceFeed + "/create-post";
const listPostService: string = baseURL +  "/posts";
const searchFeedService: string = baseURL + "/search";
const listByUsernameService = (username: string): string => `${baseURL}/posts/user/${username}`;
const listMyRidesService: string = baseURL + "/my-rdides";
const deletePostsByIDService = (id: number): string => `${baseURL}/posts/${id}`;

//messaging system
const messagingSystemService: string = baseURL + "/api/messages"
const sendMessageService: string = messagingSystemService + "/send";
const conversationService: string = messagingSystemService + "/conversation"
const withUsernameService = (username: string): string => messagingSystemService + `/with/${username}`;
const deleteWithIDService = (id: number): string => messagingSystemService + `/${id}`;


// profile controller
const profileService: string = baseURL + "api/profile";
const profileMeService: string = baseURL + "/me";
const updateBioService: string = baseURL + "/bio";
const deleteAccountService: string = baseURL + "/account";

// profile schools controller
const shoolService = (school: string): string => baseURL + `/api/schools/${school}`;


export {
    baseURL, resetPassword,
    landingURLService, listReportsService, 
    updateReportsService, removeReportsService, 
    banUserService, blockServices,
    unblockUsernameService, bookingService,
    requestBookingService, acceptRequestService,
    declineRequestService, cancleRequestService,
    termService, completeRequestService, 
    mineRequestService, incomingRequestService,
    forgotPassword, loginServices, legalService,
    privacyService, homeServiceFeed, createPostService,
    listPostService, searchFeedService, listByUsernameService,
    listMyRidesService, deletePostsByIDService, messagingSystemService,
    sendMessageService, conversationService, withUsernameService,
    deleteWithIDService, profileMeService, profileService, updateBioService, deleteAccountService,
    shoolService
}