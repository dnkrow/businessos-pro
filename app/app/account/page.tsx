import { requireActiveCompany } from "@/lib/guards";
import { PageHeader } from "@/components/ui/page-header";
import { AccountForms } from "./account-forms";

export default async function AccountPage() {
  const { user } = await requireActiveCompany();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mon compte" description="Gérez vos informations personnelles et vos identifiants." />
      <AccountForms
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email}
        locale={user.locale}
        emailVerified={!!user.emailVerifiedAt}
        phone={user.phone}
        phoneVerified={!!user.phoneVerifiedAt}
      />
    </div>
  );
}
