const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

db.run("CREATE TABLE IF NOT EXISTS entrada (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto INTEGER, quantidade REAL, valor_unitario REAL, data_entrada DATE)", (createTableError) => {


    if (createTableError) {
        return res.status(500).send({
            error: createTableError.message
        });
    }

    // O restante do código, se necessário...
});
// Mensagens de sucesso e erro
const SUCCESS_MESSAGE = "Operação realizada com sucesso";
const ERROR_MESSAGE = "Erro ao executar operação";

 



// Rota para obter uma Entrada pelo ID
router.get("/:id", (req, res, next) => {
    const { id } = req.params;

    db.all("SELECT * FROM Entrada WHERE id=?", [id], (error, rows) => {
        if (error) {
          
            return res.status(500).send({
                error: error.message
            });
        }

        res.status(200).send({
            mensagem: "Aqui está a Entrada  solicitado",
            entrada: rows
        });
    });
});





// Rota para listar todos os entradas 
router.get("/", (req, res, next) => {
    db.all(`SELECT 
    entrada.id as id, 
    entrada.id_produto as id_produto,
    entrada.quantidade as quantidade,
    produto.descricao as descricao,
    entrada.data_entrada as data_entrada,
    entrada.valor_unitario as valor_unitario
    FROM entrada 
    INNER JOIN produto 
    ON entrada.id_produto = produto.id`, (error, rows) => {
        if (error) {
            
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({
            mensagem: "Aqui estão todas as Entradas",
            entradas: rows
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


function atualizarestoque(id_produto,quantidade,valor_unitario){
    db.all('SELECT * FROM estoque WHERE id_produto=?',[id_produto], (error, rows) => {
        if (error) {
            return false;
        }
        if(rows.length>0){
            let qtde =rows[0].quantidade;
            qtde=parseFloat(qtde)+parseFloat(quantidade)
            db.run("UPDATE estoque SET quantidade=?, valor_unitario=? WHERE id_produto=?",
            [qtde, valor_unitario, id_produto], (error) => {
                if (error) {
                   return false
                }
            });
  
        }else{
            db.serialize(() => {
                const insertEstoque = db.prepare("INSERT INTO estoque(id_produto, quantidade, valor_unitario) VALUES(?,?,?)");
                insertEstoque.run(id_produto, quantidade, valor_unitario);
                insertEstoque.finalize();
            });
        }
    });
    return true;
}
// Rota para criar um novo entradas 
router.post('/', (req, res, nxt) => {
    
    db.run("CREATE TABLE IF NOT EXISTS entrada (id INTEGER PRIMARY KEY AUTOINCREMENT, id_produto INTEGER, quantidade REAL, valor_unitario REAL, data_entrada REAL)", (createTableError) => {

        if (createTableError) {
            return res.status(500).send({
                error: createTableError.message
            });
        }

        // O restante do código, se necessário...
    });

    const {id_produto , quantidade, valor_unitario,data_entrada } = req.body;

    // Validação dos campos
    let msg = [];
    var regex = /^[0-9]+$/
    if (!id_produto) {
        console.log("status deu merda")
        msg.push({ mensagem: "id do produto inválido! Não pode ser vazio." });
    }
    console.log("erro linha 95")
    if (!quantidade || quantidade.length== 0) {
        console.log("descrição deu merda")
        msg.push({ mensagem: "Quantidade inválida!" });
    }
    // if (!estoqueminimo || senha.length < 6) {
    //     msg.push({ mensagem: "Senha inválida! Deve ter pelo menos 6 caracteres." });
    // }
    //if (!estoquemaximo || senha.length < 6) {
    //   msg.push({ mensagem: "Senha inválida! Deve ter pelo menos 6 caracteres." });
    // }
    if (msg.length > 0) {
        console.log(error)
        return res.status(400).send({
            mensagem: "Falha ao cadastrar Entrada.",
            erros: msg
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


        // Insere o nova entradas  no banco de dados
        db.run(`INSERT INTO ENTRADA ( id_produto, quantidade,valor_unitario,data_entrada) VALUES (?,?,?,?)`,
            [id_produto, quantidade, valor_unitario, data_entrada], function (insertError) {
                console.log(insertError)
                if (insertError) {
                    return res.status(500).send({
                        error: insertError.message,
                        response: null
                    });
                }
               atualizarestoque(id_produto,quantidade,valor_unitario)
                res.status(201).send({
                    mensagem: "Entrada criado com sucesso!",
                    entradas: {
                        id: this.lastID,
                        quantidade,
                        valor_unitario:valor_unitario,
                        data_entrada
                    }
                });
            });
    });












// Função para validar formato de e-mail
//function validateEmail(email) {
//const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//  return re.test(String(email).toLowerCase());
//}









// Rota para atualizar um entrada existente
router.put("/", (req, res, next) => {
    const { id, id_produto, quantidade, valor_unitario, data_entrada } = req.body;

    if (!id_produto || !quantidade || !valor_unitario || !data_entrada) {
        
        return res.status(400).send({ error: "Parâmetros inválidos" });
    }

    
    db.run("UPDATE ENTRADA SET id_produto=?, quantidade=?, valor_unitario=?,data_entrada=? WHERE id=?", [id_produto, quantidade, valor_unitario, data_entrada,id], (error) => {
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
    db.run("DELETE FROM entrada WHERE id=?", id, (error) => {
        if (error) {
            return res.status(500).send({
                error: error.message
            });
        }
        res.status(200).send({ mensagem: SUCCESS_MESSAGE });
    });
});

module.exports = router;