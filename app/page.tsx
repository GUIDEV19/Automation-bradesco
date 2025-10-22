'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import AutomationForm from './components/AutomationForm';
import ProcessingStatus from './components/ProcessingStatus';
import styles from './page.module.css';

interface ProcessedResult {
  cpf: string;
  originalData: any; // Dados originais da linha
  resultado900191: string;
  resultado900198: string;
  resultado900192: string;
}

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const [results, setResults] = useState<ProcessedResult[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleProcess = async (file: File, url: string) => {
    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setProcessedFile(null);
    setResults([]);

    addLog('Iniciando processamento...');

    try {
      let jsonData: any[][] = [];
      let headers: string[] = [];
      
      // Detectar tipo de arquivo e ler dados
      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      
      if (isCSV) {
        addLog('Arquivo CSV detectado');
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        
        // Detectar delimitador (vírgula ou ponto-e-vírgula)
        const firstLine = lines[0] || '';
        const delimiter = firstLine.includes(';') ? ';' : ',';
        addLog(`Delimitador detectado: "${delimiter}"`);
        
        // Processar CSV
        jsonData = lines.map(line => {
          return line.split(delimiter).map(value => {
            // Remover aspas duplas no início e fim
            let cleaned = value.trim();
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              cleaned = cleaned.substring(1, cleaned.length - 1);
            }
            return cleaned;
          });
        }).filter(row => row.length > 0);
        
        addLog(`CSV processado: ${jsonData.length} linhas`);
      } else {
        addLog('Arquivo Excel detectado');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      }

      if (jsonData.length === 0) {
        addLog('ERRO: Arquivo vazio');
        setIsProcessing(false);
        return;
      }

      // Extrair cabeçalhos
      headers = jsonData[0].map((h: any) => String(h).trim());
      addLog(`Cabeçalhos encontrados: ${headers.join(', ')}`);

      // Encontrar coluna CPF (case insensitive)
      const cpfColumnIndex = headers.findIndex(h => 
        h.toLowerCase() === 'cpf' || 
        h.toLowerCase().includes('cpf')
      );

      if (cpfColumnIndex === -1) {
        addLog('ERRO: Coluna CPF não encontrada no arquivo!');
        addLog('Cabeçalhos disponíveis: ' + headers.join(', '));
        setIsProcessing(false);
        return;
      }

      addLog(`✅ Coluna CPF encontrada no índice ${cpfColumnIndex}: "${headers[cpfColumnIndex]}"`);

      // Filtrar linhas válidas (com CPF preenchido)
      const validRows = jsonData.slice(1).filter(row => {
        const cpf = row[cpfColumnIndex];
        return cpf && String(cpf).trim() !== '';
      });

      addLog(`${validRows.length} linhas com CPF válido para processar`);

      if (validRows.length === 0) {
        addLog('AVISO: Nenhuma linha com CPF válido encontrada!');
        setIsProcessing(false);
        return;
      }

      // Códigos fixos para testar
      const CODIGOS_FIXOS = ['900191', '900198', '900192'];
      addLog(`Testando ${CODIGOS_FIXOS.length} códigos por CPF: ${CODIGOS_FIXOS.join(', ')}`);

      // Processar cada linha
      const tableResults: ProcessedResult[] = [];
      const totalOperations = validRows.length * CODIGOS_FIXOS.length;
      let currentOperation = 0;
      
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        const cpf = String(row[cpfColumnIndex]).trim();
        
        addLog(`\n=== CPF ${i + 1}/${validRows.length}: ${cpf} ===`);

        const resultadosCPF: any = {
          cpf,
          originalData: row,
          resultado900191: 'Não',
          resultado900198: 'Não',
          resultado900192: 'Não'
        };

        // Testar cada código
        for (const codigo of CODIGOS_FIXOS) {
          currentOperation++;
          addLog(`Testando código ${codigo}...`);

          try {
            const automationResult = await runAutomation(url, cpf, codigo);
            const resultado = automationResult.success ? 'Sim' : 'Não';
            
            // Atualizar resultado específico
            if (codigo === '900191') resultadosCPF.resultado900191 = resultado;
            else if (codigo === '900198') resultadosCPF.resultado900198 = resultado;
            else if (codigo === '900192') resultadosCPF.resultado900192 = resultado;
            
            addLog(`  ${codigo}: ${resultado} - ${automationResult.message}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro';
            addLog(`  ${codigo}: Erro - ${errorMessage}`);
            // Mantém "Não" como padrão em caso de erro
          }

          setProgress(Math.round((currentOperation / totalOperations) * 100));
        }

        tableResults.push(resultadosCPF);
      }

      // Atualizar estado com resultados
      setResults(tableResults);

      // Criar novo arquivo Excel com TODOS os dados originais + 3 novas colunas
      const excelResults: any[][] = [];
      
      // Cabeçalho: todas colunas originais + 3 novas
      excelResults.push([...headers, '900191', '900198', '900192']);
      
      // Dados: todas colunas originais + resultados
      for (const result of tableResults) {
        const rowData = [...result.originalData, result.resultado900191, result.resultado900198, result.resultado900192];
        excelResults.push(rowData);
      }

      const newWorkbook = XLSX.utils.book_new();
      const newWorksheet = XLSX.utils.aoa_to_sheet(excelResults);
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Resultados');
      
      const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      setProcessedFile(blob);
      addLog(`\n✅ Processamento concluído! ${tableResults.length} CPFs testados com ${CODIGOS_FIXOS.length} códigos cada.`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`ERRO CRÍTICO: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const runAutomation = async (url: string, cpf: string, codigo: string): Promise<{ success: boolean, message: string }> => {
    // Chamar a API de automação
    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, cpf, codigo }),
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message || (result.success ? 'SUCESSO' : 'FALHA')
      };
    } catch (error) {
      throw new Error('Erro ao executar automação');
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;

    const url = window.URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_${new Date().getTime()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Automação de Planilhas Excel</h1>
        <p className={styles.description}>
          Sistema de automação web com processamento de planilhas Excel
        </p>

        <AutomationForm 
          onProcess={handleProcess} 
          isProcessing={isProcessing}
        />

        {(isProcessing || logs.length > 0) && (
          <ProcessingStatus 
            progress={progress}
            logs={logs}
            isProcessing={isProcessing}
            onDownload={processedFile ? handleDownload : undefined}
            results={results}
          />
        )}
      </main>
    </div>
  );
}

