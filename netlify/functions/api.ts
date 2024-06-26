import cors from 'cors';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import unorm from 'unorm';
const readXlsxFile = require('read-excel-file/node');
import { storageRef } from './firebase/firebase';

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
    const grupos = {};
    objects.forEach((objeto) => {
      const uf = objeto['UF da sede'];
      if (!grupos[uf]) {
        grupos[uf] = [];
      }
      grupos[uf].push(objeto);
    });
    for (const uf in grupos) {
      if (grupos.hasOwnProperty(uf)) {
        const arraySindicatos = grupos[uf];
        const file = storageRef.file(`${uf}.json`);
        file.save(JSON.stringify(arraySindicatos), {
          gzip: true,
          metadata: {
            cacheControl: 'public, max-age=31536000',
          },
        });
      }
    }
    res.send(grupos);
  });
});
router.post('/sindicatoPorClasseUF', (req, res) => {
  let categoria = req.body.categoria;
  let uf = req.body.uf;
  let cidade = req.body.baseTerritorial;
  let classe = req.body.classe;
  let objects = [];
  const file = storageRef.file(`${uf}.json`);
  file.download().then((data) => {
    objects = JSON.parse(data.toString());
    const normalizarTexto = (texto) =>
      texto
        ? unorm.nfd(texto.toLowerCase()).replace(/[\u0300-\u036f]/g, '')
        : '';
    let newArray = objects.filter((objeto) => {
      // Verifica se os valores passados estão contidos nos respectivos campos do objeto
      const classeMatch = classe
        ? normalizarTexto(objeto.Classe).includes(
            normalizarTexto(classe.toLowerCase())
          )
        : true;
      const categoriaMatch = categoria
        ? normalizarTexto(objeto.Categoria).includes(
            normalizarTexto(categoria.toLowerCase())
          )
        : true;
      const ufMatch = uf
        ? normalizarTexto(objeto['UF da sede']).includes(
            normalizarTexto(uf.toLowerCase())
          )
        : true;
      const baseTerritorialMatch = cidade
        ? normalizarTexto(objeto['Base Territorial']).includes(
            normalizarTexto(cidade.toLowerCase())
          )
        : true;

      // Retorna verdadeiro apenas se todas as condições forem verdadeiras
      return classeMatch && categoriaMatch && ufMatch && baseTerritorialMatch;
    });
    res.send(newArray);
  });
});
api.use('/api/', router);
// api.listen(3333, () => 'server running on port 3333');
export const handler = serverless(api);
