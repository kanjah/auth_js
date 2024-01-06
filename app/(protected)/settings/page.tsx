import { auth, signOut } from "@/auth";

const SettingsPAge =async () => {
const session = await auth()

session?.user.id
    return (
        <div>
            {JSON.stringify(session)}
<form action={async () => {
    "use server";
    await signOut()
}}>
    <button type="submit">Sign out</button>

</form>
            
        </div>
    )
}
export default SettingsPAge;