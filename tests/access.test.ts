import { describe, expect, it } from "vitest";
import { accessFor } from "../lib/access";

const doc={ownerId:"owner-1",shares:[
  {email:"editor@example.com",permission:"edit" as const},
  {email:"viewer@example.com",permission:"view" as const}
]};

describe("document access",()=>{
  it("gives owner edit access",()=>expect(accessFor(doc,"owner-1","owner@example.com").canEdit).toBe(true));
  it("allows shared editor to edit",()=>expect(accessFor(doc,"user-2","editor@example.com").canEdit).toBe(true));
  it("keeps viewer read-only",()=>expect(accessFor(doc,"user-3","viewer@example.com").canEdit).toBe(false));
  it("rejects unshared users",()=>expect(accessFor(doc,"user-4","other@example.com").canView).toBe(false));
});
