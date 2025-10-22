const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Dados de exemplo
const data = [
  ['CPF', 'Código'],
  ['123.456.789-00', 'ABC123'],
  ['987.654.321-00', 'XYZ789'],
  ['111.222.333-44', 'DEF456'],
  ['555.666.777-88', 'GHI789'],
  ['999.888.777-66', 'JKL012'],
];

// Criar workbook
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Adicionar worksheet ao workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

// Salvar arquivo
const filePath = path.join(__dirname, '..', 'exemplo-planilha.xlsx');
XLSX.writeFile(workbook, filePath);

console.log('✅ Planilha de exemplo criada:', filePath);

