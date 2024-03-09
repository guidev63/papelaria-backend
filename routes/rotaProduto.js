const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";


// Rota para obter um usuário pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    db.all("SELECT * FROM PRODUTO WHERE id=?", [id], (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está o Produto solicitado",
            usuario: rows
        });
    });
});

// Rota para listar todos os usuários
router.get("/", (req, res, next) => {
    db.all("SELECT * FROM produto ", (error, rows) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Aqui estão todos os Produto",
            produtos: rows
        });
    });
});

// Rota para listar apenas nomes e emails dos usuários
//router.get("/nomes", (req, res, next) => {
//  db.all("SELECT nome, email FROM usuario", (error, rows) => {
//     if (error) {
//        return res.status(500).send({
//          error: error.message
//     });
//      }
//res.status(200).send(rows);
//   });
//});

// Rota para criar um novo usuário
router.post('/', (req, res, nxt) => {
    db.run("CREATE TABLE IF NOT EXISTS produto (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, descricao TEXT, estoqueminimo REAL, estoquemaximo REAL)", (createTableError) => {

        if (createTableError) {
            return res.status(500).send({
                error: createTableError.message
            });
        }

        // O restante do código, se necessário...
    });

    const { status, descricao, estoque_minimo, estoque_maximo } = req.body;

    // Validação dos campos
    let msg = [];
    var regex = /^[0-9]+$/
    if (!status) {
        console.log("status deu merda")
        msg.push({ mensagem: "Status inválido! Não pode ser vazio." });
    }
    console.log("erro linha 95")
    if (!descricao || descricao.length < 3) {
        console.log("descrição deu merda")
        msg.push({ mensagem: "descrição inválida!" });
    }
    // if (!estoqueminimo || senha.length < 6) {
    //     msg.push({ mensagem: "Senha inválida! Deve ter pelo menos 6 caracteres." });
    // }
    //if (!estoquemaximo || senha.length < 6) {
    //   msg.push({ mensagem: "Senha inválida! Deve ter pelo menos 6 caracteres." });
    // }
    if (msg.length > 0) {
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Produto.",
            erros: msg
        });
    }

    // Verifica se o email já está cadastrado
    db.get(`SELECT * FROM produto WHERE descricao  = ?`, [descricao], (error, produtoExistente) => {
        if (error) {
            console.log(error)
            return res.status(500).send({
                error: error.message,
                response: null
            });
        }

        if (produtoExistente) {
            return res.status(400).send({
                mensagem: "Produto já cadastrado."
            });
        }

        // Hash da senha antes de salvar no banco de dados
        //  bcrypt.hash(senha, 10, (hashError, hashedPassword) => {
        //   if (hashError) {
        //   return res.status(500).send({
        //      error: hashError.message,
        //      response: null
        // });
        // }




        // Insere o novo usuário no banco de dados
        db.run(`INSERT INTO PRODUTO ( status, descricao,estoque_minimo,estoque_maximo) VALUES (?,?,?,?)`,
            [status, descricao, estoque_minimo, estoque_maximo], function (insertError) {
                console.log(insertError)
                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message,
                        response: null
                    });
                }
                res.status(201).send({
                    mensagem: "Produto criado com sucesso!",
                    produtos: {
                        id: this.lastID,
                        descricao: descricao,
                        estoque_minimo: estoque_minimo
                    }
                });
            });
    });
});


// Função para validar formato de e-mail
//function validateEmail(email) {
//const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//  return re.test(String(email).toLowerCase());
//}





// Rota para atualizar um usuário existente
router.put("/", (req, res, next) => {
    const { status, descricao, estoqueminimo, estoquemaximo } = req.body;

    if (!id || !nome || !email || !senha) {
        return res.status(400).send({ error: "Parâmetros inválidos" });
    }

    db.run("UPDATE PRODUTO SET status=?, descicao=?, estoqueminimo=?,estoquemaximo=? WHERE id=?", [status, descricao, estoqueminimo, estoquemaximo], (error) => {
        if (error) {

            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({ mensagem: SUCCESS_MESSAGE });
    });
});





// Rota para excluir um usuário pelo ID
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    db.run("DELETE FROM produto WHERE id=?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({ mensagem: SUCCESS_MESSAGE });
    });
});

module.exports = router;