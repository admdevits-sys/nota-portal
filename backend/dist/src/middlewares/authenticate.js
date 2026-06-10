export async function authenticate(req, reply) {
    try {
        const token = await req.jwtVerify();
        // jwtVerify lança erro se inválido; aqui token é seguro
        req.user = {
            usuarioId: token.usuarioId,
            perfilId: token.perfilId,
            perfilNome: token.perfilNome,
            email: token.email,
        };
    }
    catch (err) {
        reply.code(401).send({ error: "UNAUTHORIZED", message: "Token inválido ou expirado." });
    }
}
