'use client';

import styles from './ProcessingStatus.module.css';

interface ProcessedResult {
  cpf: string;
  originalData: any;
  resultado900191: string;
  resultado900198: string;
  resultado900192: string;
}

interface ProcessingStatusProps {
  progress: number;
  logs: string[];
  isProcessing: boolean;
  onDownload?: () => void;
  results?: ProcessedResult[];
}

export default function ProcessingStatus({ 
  progress, 
  logs, 
  isProcessing,
  onDownload,
  results = []
}: ProcessingStatusProps) {
  // Contar quantos CPFs têm pelo menos 1 "Sim"
  const cpfsComSucesso = results.filter(r => 
    r.resultado900191 === 'Sim' || r.resultado900198 === 'Sim' || r.resultado900192 === 'Sim'
  ).length;
  
  // Contar quantos CPFs têm todos "Não"
  const cpfsSemSucesso = results.filter(r => 
    r.resultado900191 === 'Não' && r.resultado900198 === 'Não' && r.resultado900192 === 'Não'
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progresso</span>
          <span className={styles.progressValue}>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tabela de Resultados */}
      {results.length > 0 && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>📊 Resultados do Processamento</h3>
            <div className={styles.resultsSummary}>
              <span className={styles.successBadge}>✅ {cpfsComSucesso} CPFs com Sucesso</span>
              <span className={styles.failureBadge}>❌ {cpfsSemSucesso} CPFs sem Sucesso</span>
              <span className={styles.totalBadge}>📝 {results.length} CPFs Testados</span>
            </div>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>CPF</th>
                  <th>900191</th>
                  <th>900198</th>
                  <th>900192</th>
                  <th>Resumo</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const temSucesso = result.resultado900191 === 'Sim' || 
                                    result.resultado900198 === 'Sim' || 
                                    result.resultado900192 === 'Sim';
                  
                  return (
                    <tr key={index} className={temSucesso ? styles.rowSuccess : styles.rowFailure}>
                      <td>{index + 1}</td>
                      <td className={styles.cellCpf}>{result.cpf}</td>
                      <td className={styles.cellCodigo}>
                        <span className={result.resultado900191 === 'Sim' ? styles.badgeSim : styles.badgeNao}>
                          {result.resultado900191}
                        </span>
                      </td>
                      <td className={styles.cellCodigo}>
                        <span className={result.resultado900198 === 'Sim' ? styles.badgeSim : styles.badgeNao}>
                          {result.resultado900198}
                        </span>
                      </td>
                      <td className={styles.cellCodigo}>
                        <span className={result.resultado900192 === 'Sim' ? styles.badgeSim : styles.badgeNao}>
                          {result.resultado900192}
                        </span>
                      </td>
                      <td className={styles.cellBadge}>
                        {temSucesso ? (
                          <span className={styles.badgeSuccess}>✅ TEM CADASTRO</span>
                        ) : (
                          <span className={styles.badgeFailure}>❌ SEM CADASTRO</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.logsSection}>
        <h3 className={styles.logsTitle}>Logs de Processamento</h3>
        <div className={styles.logsContainer}>
          {logs.map((log, index) => (
            <div key={index} className={styles.logEntry}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {!isProcessing && onDownload && (
        <button onClick={onDownload} className={styles.downloadButton}>
          📥 Baixar Planilha Processada
        </button>
      )}
    </div>
  );
}

