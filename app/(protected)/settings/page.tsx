
"use client";

import { logout } from "@/actions/logout";
import { useCurrentUser } from "@/hooks/use-current-user";



const SettingsPAge = () => {
const user = useCurrentUser
const onClick = () => {
   logout();
}


    return (
        <div className="bg-white  p-10 rounded-xl">
            {/* {JSON.stringify(user)} */}
            <button onClick={onClick} type="submit">
                Sign out
            </button>
        </div>
    )
}
export default SettingsPAge;