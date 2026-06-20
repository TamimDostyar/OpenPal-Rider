import {forgotPassword, loginServices, resetPassword} from '../configuration/config';

// this is for the authentication
export class Authentication{

    async forgotPassword(email: string): Promise<string>{
        const response = await fetch(forgotPassword, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email
            })
        })

        if (!response.ok){
            return "there was an error with parsing the code";
        }

        const data = await response.json();
        return data;
    }

    async resetPassword(token: string, newPassword: string): Promise<string>{
        const response = await fetch(resetPassword, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                newPassword
            })
        })

        if (!response.ok){
            return "there was an error with parsing the code";
        }

        const data = await response.json();
        return data;
    }

  
    async logIntoSystem(email: string, password: string): Promise<string>{
        const response = await fetch(loginServices, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            

            if (!response.ok){
                const data = await response.json();
                throw new Error(data.error || "Login Failed");
            }
            

            const data = await response.json();
            console.log("Successfully logged in");
            return data.token;

        }
}


// const authentication = new Authentication();
// console.log(authentication.forgotPassword('dostah01@luther.edu').then(data => console.log(data)).catch(error => console.log(error)));
// console.log(authentication.resetPassword('mpymSQ', 'Test@123').then(data => console.log(data)).catch(error => console.log(error)));