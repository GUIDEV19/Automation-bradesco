import * as XLSX from 'xlsx';

export interface ExcelRow {
  cpf: string;
  codigo: string;
  status?: string;
}

/**
 * Lê um arquivo Excel e retorna os dados como array
 */
export async function readExcelFile(file: File): Promise<ExcelRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const rows: ExcelRow[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row[0] && row[1]) {
      rows.push({
        cpf: String(row[0]),
        codigo: String(row[1]),
      });
    }
  }

  return rows;
}

/**
 * Cria um arquivo Excel a partir dos dados processados
 */
export function createExcelFile(rows: ExcelRow[]): Blob {
  const worksheetData = [
    ['CPF', 'Código', 'Status'],
    ...rows.map(row => [row.cpf, row.codigo, row.status || ''])
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}

/**
 * Valida se um CPF tem formato válido
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  return cleanCPF.length === 11;
}

/**
 * Formata um CPF
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

