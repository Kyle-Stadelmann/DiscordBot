import { GuildMember } from "discord.js";

async function removeRoles(member: GuildMember, roleIds: string[]) {
    const removePromises: Promise<GuildMember>[] = [];
    for (const r of roleIds) {
        if (member.roles.resolve(r)) {
            removePromises.push(member.roles.remove(r));
        }
    }
    await Promise.all(removePromises);
}

async function addAndRemoveRoles(newRole: string, member: GuildMember, roleIds: string[]) {
    await removeRoles(member, roleIds);
    await member.roles.add(newRole);
}

export async function rotateThroughRoles(displayOrderMemberList: GuildMember[], roleIdOrder: string[]) {
    if (displayOrderMemberList?.length === 0 || roleIdOrder?.length === 0) {
        throw new Error("Invalid arguments to rotateThroughRoles");
    }

    const rolePromises: Promise<void>[] = [];
    for (let i=0; i<displayOrderMemberList.length; i+=1) {
        const currMember = displayOrderMemberList[i];
        const currRoleId = roleIdOrder[i % roleIdOrder.length];
        rolePromises.push(addAndRemoveRoles(currRoleId, currMember, roleIdOrder));
    }
    await Promise.all(rolePromises);
}