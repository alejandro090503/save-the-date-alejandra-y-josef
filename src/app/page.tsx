import { InvitationClient } from "./_components/InvitationClient";
import { Loader } from "./_components/Loader";

export default function Page() {
  return (
    <Loader>
      <InvitationClient />
    </Loader>
  );
}
