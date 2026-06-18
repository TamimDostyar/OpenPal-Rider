import { 
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
} from '../configuration/config';

// this is for testing, alright?
// class SystemEndpoints {    
//     async landingPageService(){
//         const response = await fetch(landingURLService);
//         if (!response.ok){
//             return {"error": "response is not okay"};
//         }
//         const data = (await response.json());
//         return data;
//     }

// }
// class FeedSystems{
//     // homeServiceFeed
//     async getFeedData(jwtCode: string){
//         fetch(homeServiceFeed,
//             {
//                 method: 'POST',
//                 body: JSON.stringify({
                    
//                 })
//             }


//         )
//     }
// }

// const systemEndpoint = new SystemEndpoints();
// systemEndpoint.landingPageService()
//     .then(data =>console.log(data))
//     .catch(error => console.log(error));
