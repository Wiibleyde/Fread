"use client"

import { useEffect, useState } from "react";

const ProfilePage = () => {

    const [accountData, setAccountData] = useState(null);
    const [postData, setPostData] = useState(null);

    const handleSubmit = async () => {
        try {
            const res = await fetch("/api/account", {
                method: "GET",
            });
            const data = await res.json();
            setAccountData(data.account);
            setPostData(data.posts);
            console.log("   Profile data:", data);
        } catch (_err) {
            console.log("An unexpected error occurred");
        }
    };

    useEffect(() => {
        handleSubmit();
    }, []);

    return (
        <div>
            <h1>Profile Page</h1>
            {accountData ? (
                <div>
                    <h2>Account Information:</h2>
                    <pre>{JSON.stringify(accountData, null, 2)}</pre>
                </div>
            ) : (
                <p>Loading account information...</p>
            )}
            {postData ? (
                <div>
                    <h2>User Posts:</h2>
                    <pre>{JSON.stringify(postData, null, 2)}</pre>
                </div>
            ) : (
                <p>Loading user posts...</p>
            )}
        </div>
    )
}

export default ProfilePage