export function getJwtPayloadFromReq(req) {
    const user = req.user;
    return user ?? null;
}
