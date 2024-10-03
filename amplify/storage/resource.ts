import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "onyxStoreNextGen2Bucket",
  access: (allow) => ({
    "product-images/{entity_id}/*": [
      allow.guest.to(['read', 'write', 'delete']),
      //allow.authenticated.to(["read"]),
      allow.entity('identity').to(['read', 'write', 'delete'])
      //allow.groups(["Admins"]).to(["read", "write", "delete"]),
    ],
  }),
});
