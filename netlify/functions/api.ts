import cors from 'cors';
import express, { Router } from 'express';
import serverless from 'serverless-http';
const readXlsxFile = require('read-excel-file/node');

const api = express();

const router = Router();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

api.use(cors(corsOptions));
api.use(express.json());

router.get('/', (req, res) => res.send('Hello World find sindicato!'));
router.get('/sindicato', (req, res) => {
  readXlsxFile(
    './netlify/functions/table-sindicatos/SINDICATOSBRASIL 1.xlsx'
  ).then((rows) => {
    const columns = rows[0]; // Primeiro elemento contém os nomes das colunas
    const filteredColumns = [
      'CNPJ',
      'Denominação',
      'Código Sindical Completo',
      'Federação',
      'Classe',
      'Categoria',
      'Logradouro',
      'Complemento',
      'Número',
      'Bairro',
      'CEP',
      'Localidade da sede',
      'UF da sede',
      'E-mail',
      'Telefone 1',
      'Base Territorial',
    ];
    const objects = [];

    // Índices das colunas filtradas
    const filteredIndexes = filteredColumns.map((col) => columns.indexOf(col));

    for (let i = 1; i < rows.length; i++) {
      const obj = {};
      filteredIndexes.forEach((index) => {
        // Adiciona apenas as colunas filtradas ao objeto
        obj[filteredColumns[filteredIndexes.indexOf(index)]] = rows[i][index];
      });
      objects.push(obj);
    }
    res.send(objects);
  });
});
router.post('/sindicatoPorClasseUF', (req, res) => {
  let categoria = req.body.categoria;
  let uf = req.body.uf;
  let cidade = req.body.baseTerritorial;
  let classe = req.body.classe;

  readXlsxFile(
    './netlify/functions/table-sindicatos/SINDICATOSBRASIL 1.xlsx'
  ).then((rows) => {
    const columns = rows[0]; // Primeiro elemento contém os nomes das colunas
    const filteredColumns = [
      'CNPJ',
      'Denominação',
      'Código Sindical Completo',
      'Federação',
      'Classe',
      'Categoria',
      'Logradouro',
      'Complemento',
      'Número',
      'Bairro',
      'CEP',
      'Localidade da sede',
      'UF da sede',
      'E-mail',
      'Telefone 1',
      'Base Territorial',
    ];
    const objects = [];

    // Índices das colunas filtradas
    const filteredIndexes = filteredColumns.map((col) => columns.indexOf(col));

    for (let i = 1; i < rows.length; i++) {
      const obj = {};
      filteredIndexes.forEach((index) => {
        // Adiciona apenas as colunas filtradas ao objeto
        obj[filteredColumns[filteredIndexes.indexOf(index)]] = rows[i][index];
      });
      objects.push(obj);
    }
    let newArray = objects.filter((objeto) => {
      // Verifica se os valores passados estão contidos nos respectivos campos do objeto
      const classeMatch = classe
        ? new RegExp(classe, 'i').test(objeto.Classe)
        : true;
      const categoriaMatch = categoria
        ? new RegExp(categoria, 'i').test(objeto.Categoria)
        : true;
      const ufMatch = uf
        ? new RegExp(uf, 'i').test(objeto['UF da sede'])
        : true;
      const baseTerritorialMatch = cidade
        ? new RegExp(cidade, 'i').test(objeto['Base Territorial'])
        : true;

      // Retorna verdadeiro apenas se todas as condições forem verdadeiras
      return classeMatch && categoriaMatch && ufMatch && baseTerritorialMatch;
    });
    res.send(newArray);
  });
});
api.use('/api/', router);
api.listen(3333, () => 'server running on port 3333');
