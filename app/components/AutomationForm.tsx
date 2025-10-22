'use client';

import { useState, useRef } from 'react';
import styles from './AutomationForm.module.css';

interface AutomationFormProps {
  onProcess: (file: File, url: string) => void;
  isProcessing: boolean;
}

export default function AutomationForm({ onProcess, isProcessing }: AutomationFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange chamado');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('Arquivo selecionado:', selectedFile.name);
      console.log('Tipo:', selectedFile.type);
      console.log('Tamanho:', selectedFile.size);
      setFile(selectedFile);
    } else {
      console.log('Nenhum arquivo encontrado');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    console.log('URL alterada:', newUrl);
    setUrl(newUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit chamado - File:', file?.name, 'URL:', url);
    if (file && url) {
      console.log('Processando...');
      onProcess(file, url);
    } else {
      console.error('Faltando dados:', { file: !!file, url: !!url });
      alert('Por favor, selecione uma planilha e digite a URL');
    }
  };

  const handleReset = () => {
    setFile(null);
    setUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="file" className={styles.label}>
          Planilha Excel
        </label>
        <div className={styles.fileInputWrapper}>
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={isProcessing}
            className={styles.fileInput}
          />
          {file && (
            <div className={styles.fileName}>
              <span>📄 {file.name}</span>
              <button 
                type="button" 
                onClick={handleReset}
                className={styles.clearButton}
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <small className={styles.hint}>
          Arquivo Excel (.xlsx, .xls) ou CSV com coluna "CPF"
        </small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="url" className={styles.label}>
          URL do Site
        </label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://exemplo.com.br"
          disabled={isProcessing}
          className={styles.input}
        />
        <small className={styles.hint}>
          URL do site onde os dados serão inseridos
        </small>
      </div>

      <button 
        type="button"
        onClick={handleSubmit}
        className={styles.button}
        disabled={!file || !url || isProcessing}
        title={!file ? 'Selecione uma planilha' : !url ? 'Insira uma URL' : 'Clique para iniciar'}
        style={{
          opacity: (!file || !url || isProcessing) ? 0.5 : 1,
          cursor: (!file || !url || isProcessing) ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessing ? 'Processando...' : 'Iniciar Automação'}
      </button>
      
      {/* Debug info - sempre visível e detalhado */}
      <div style={{ 
        marginTop: '15px', 
        fontSize: '13px', 
        color: '#333', 
        padding: '15px', 
        background: '#f8f9fa', 
        border: '2px solid #dee2e6',
        borderRadius: '8px',
        fontFamily: 'monospace'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>🔍 Status do Sistema:</div>
        <div style={{ marginBottom: '5px' }}>
          Arquivo: {file ? `✅ ${file.name} (${(file.size / 1024).toFixed(2)} KB)` : '❌ Nenhum arquivo selecionado'}
        </div>
        <div style={{ marginBottom: '5px' }}>
          URL: {url ? `✅ ${url}` : '❌ URL vazia'}
        </div>
        <div style={{ marginBottom: '5px' }}>
          Processando: {isProcessing ? '⏳ Sim' : '✅ Não'}
        </div>
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          background: (!file || !url) ? '#fff3cd' : '#d4edda',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          Botão: {(!file || !url) ? '🔒 BLOQUEADO (preencha os campos acima)' : '✅ DISPONÍVEL - Clique para iniciar!'}
        </div>
      </div>
    </form>
  );
}

