export function authorize(requiredPerfis) {
    return async (req, reply) => {
        const user = req.user;
        if (!user) {
            reply.code(401).send({ error: "UNAUTHORIZED", message: "Não autenticado." });
            return;
        }
        const isAuthorized = requiredPerfis.some((required) => required === user.perfilId || required === user.perfilNome);
        if (!isAuthorized) {
            reply.code(403).send({ error: "FORBIDDEN", message: "Sem permissão." });
            return;
        }
    };
}
