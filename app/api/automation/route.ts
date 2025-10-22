import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  try {
    const { url, cpf, codigo } = await request.json();

    if (!url || !cpf || !codigo) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Converter CPF e Código para string (podem vir como números do Excel)
    const cpfString = String(cpf).trim();
    const codigoString = String(codigo).trim();
    
    console.log('Dados recebidos:', { cpf: cpfString, codigo: codigoString });

    // Inicializar o Playwright
    console.log('Iniciando Playwright...');
    
    // Tentar diferentes abordagens para encontrar o Chromium
    let browser;
    try {
      // Primeira tentativa: usar chromium padrão
      console.log('Tentativa 1: Chromium padrão');
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('✅ Chromium padrão funcionou');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log('❌ Chromium padrão falhou:', errorMessage);
      
      try {
        // Segunda tentativa: usar chromium headless shell
        console.log('Tentativa 2: Chromium headless shell');
        browser = await chromium.launch({
          headless: true,
          channel: 'chrome', // Tentar usar Chrome do sistema
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        });
        console.log('✅ Chrome do sistema funcionou');
      } catch (error2) {
        const errorMessage2 = error2 instanceof Error ? error2.message : 'Erro desconhecido';
        console.log('❌ Chrome do sistema falhou:', errorMessage2);
        
        // Terceira tentativa: usar caminho do Playwright
        console.log('Tentativa 3: Caminho do Playwright');
        browser = await chromium.launch({
          headless: true,
          executablePath: '/opt/render/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        });
        console.log('✅ Chromium do Playwright funcionou');
      }
    }

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
      // Navegar para a URL
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Aguardar a página carregar completamente
      await page.waitForLoadState('domcontentloaded');

      // ===================================================================
      // PASSO 0: Verificar e aceitar cookies (se existir)
      // ===================================================================
      
      console.log('Verificando se há botão de Aceitar Cookies...');
      try {
        // Procurar por botão de cookies com diversos seletores possíveis
        const cookieButtonSelectors = [
          'button:has-text("Aceitar")',
          'button:has-text("Aceitar Cookies")',
          'button:has-text("Accept")',
          'button:has-text("Concordo")',
          '[id*="cookie" i]:has-text("Aceitar")',
          '[class*="cookie" i]:has-text("Aceitar")',
          '#onetrust-accept-btn-handler',
          '.cookie-accept',
          '[aria-label*="Aceitar" i]'
        ];

        let cookieButtonFound = false;

        for (const selector of cookieButtonSelectors) {
          try {
            const cookieButton = await page.locator(selector).first();
            const count = await cookieButton.count();
            
            if (count > 0) {
              const isVisible = await cookieButton.isVisible();
              
              if (isVisible) {
                console.log(`Botão de cookies encontrado com seletor: ${selector}`);
                console.log('Clicando no botão Aceitar Cookies...');
                await cookieButton.click();
                await page.waitForTimeout(1000);
                console.log('✅ Cookies aceitos com sucesso!');
                cookieButtonFound = true;
                break;
              }
            }
          } catch (error) {
            // Continuar tentando outros seletores
            continue;
          }
        }

        if (!cookieButtonFound) {
          console.log('Botão de cookies não encontrado (isso é ok)');
        }
      } catch (error) {
        console.log('Erro ao procurar botão de cookies (continuando...):', error);
      }

      // ===================================================================
      // PASSO 1: Clicar no botão "Cadastre-se"
      // ===================================================================
      
      console.log('Procurando botão Cadastre-se...');
      const cadastreSeButton = await page.locator('[title="Cadastre-se"]');
      await cadastreSeButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Botão Cadastre-se encontrado, clicando...');
      await cadastreSeButton.click();
      
      // Aguardar 4 segundos para nova página renderizar
      console.log('Aguardando 4 segundos para página renderizar...');
      await page.waitForTimeout(4000);
      console.log('Página renderizada, continuando...');

      // ===================================================================
      // PASSO 2: Preencher formulário - IDs específicos
      // ===================================================================
      
      // ===================================================================
      // Campo CPF - Preenchimento Robusto
      // ===================================================================
      console.log('Procurando campo CPF (#atend-auto-cpf-cnpj)...');
      const cpfInput = await page.locator('#atend-auto-cpf-cnpj');
      await cpfInput.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Campo CPF encontrado!');
      
      // Estratégia múltipla de preenchimento
      try {
        // 1. Clicar no campo para dar foco
        console.log('Clicando no campo CPF...');
        await cpfInput.click();
        await page.waitForTimeout(300);
        
        // 2. Limpar campo (se tiver algo)
        console.log('Limpando campo CPF...');
        await cpfInput.clear();
        await page.waitForTimeout(200);
        
        // 3. Preencher usando fill()
        console.log('Preenchendo CPF:', cpfString);
        await cpfInput.fill(cpfString);
        await page.waitForTimeout(500);
        
        // 4. Verificar se foi preenchido
        const cpfValue = await cpfInput.inputValue();
        console.log('Valor no campo CPF após fill():', cpfValue);
        
        // 5. Se não preencheu, tentar com type()
        if (!cpfValue || cpfValue === '') {
          console.log('Campo vazio! Tentando com type()...');
          await cpfInput.click();
          await cpfInput.type(cpfString, { delay: 50 });
          await page.waitForTimeout(500);
          
          const cpfValue2 = await cpfInput.inputValue();
          console.log('Valor no campo CPF após type():', cpfValue2);
        }
        
        // 6. Se ainda não preencheu, tentar com evaluate
        const finalCpfValue = await cpfInput.inputValue();
        if (!finalCpfValue || finalCpfValue === '') {
          console.log('Ainda vazio! Tentando com JavaScript direto...');
          await page.evaluate((value) => {
            const input = document.querySelector('#atend-auto-cpf-cnpj') as HTMLInputElement;
            if (input) {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, cpfString);
          await page.waitForTimeout(500);
        }
        
        console.log('CPF preenchido com sucesso!');
      } catch (error) {
        console.error('Erro ao preencher CPF:', error);
        throw new Error('Falha ao preencher campo CPF');
      }

      // ===================================================================
      // Campo Apólice - Preenchimento Robusto
      // ===================================================================
      console.log('Procurando campo Apólice (#apolice)...');
      const codigoInput = await page.locator('#apolice');
      await codigoInput.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Campo Apólice encontrado!');
      
      try {
        // 1. Clicar no campo
        console.log('Clicando no campo Apólice...');
        await codigoInput.click();
        await page.waitForTimeout(300);
        
        // 2. Limpar
        console.log('Limpando campo Apólice...');
        await codigoInput.clear();
        await page.waitForTimeout(200);
        
        // 3. Preencher
        console.log('Preenchendo Apólice:', codigoString);
        await codigoInput.fill(codigoString);
        await page.waitForTimeout(500);
        
        // 4. Verificar
        const codigoValue = await codigoInput.inputValue();
        console.log('Valor no campo Apólice após fill():', codigoValue);
        
        // 5. Alternativa com type()
        if (!codigoValue || codigoValue === '') {
          console.log('Campo vazio! Tentando com type()...');
          await codigoInput.click();
          await codigoInput.type(codigoString, { delay: 50 });
          await page.waitForTimeout(500);
          
          const codigoValue2 = await codigoInput.inputValue();
          console.log('Valor no campo Apólice após type():', codigoValue2);
        }
        
        // 6. Alternativa com JavaScript
        const finalCodigoValue = await codigoInput.inputValue();
        if (!finalCodigoValue || finalCodigoValue === '') {
          console.log('Ainda vazio! Tentando com JavaScript direto...');
          await page.evaluate((value) => {
            const input = document.querySelector('#apolice') as HTMLInputElement;
            if (input) {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, codigoString);
          await page.waitForTimeout(500);
        }
        
        console.log('Apólice preenchida com sucesso!');
      } catch (error) {
        console.error('Erro ao preencher Apólice:', error);
        throw new Error('Falha ao preencher campo Apólice');
      }
      
            // Screenshot desabilitado para produção
            console.log('Screenshot desabilitado para produção');
            // await page.screenshot({ path: `debug-preenchido-${Date.now()}.png` });
      
      await page.waitForTimeout(1000);

      // ===================================================================
      // PASSO 3: Clicar no botão de Cadastro final
      // ===================================================================
      
      // Botão de Cadastro - ID: btnCadastro
      console.log('Clicando no botão Cadastro...');
      const submitButton = await page.locator('#btnCadastro');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      
      // Aguardar a resposta (pode ser redirecionamento ou mensagem)
      console.log('Aguardando resposta do servidor...');
      await page.waitForTimeout(3000);
        
      // ===================================================================
      // VERIFICAR RESULTADO - NOVA LÓGICA
      // ===================================================================
      
      console.log('Verificando resultado...');
      
      // 1. PRIMEIRO: Verificar se há erro específico #spErro
      let hasSpecificError = false;
      let errorMessage = '';
      
      try {
        const errorElement = await page.locator('#spErro');
        const errorCount = await errorElement.count();
        
        if (errorCount > 0) {
          const errorText = await errorElement.textContent();
          console.log('Elemento #spErro encontrado com texto:', errorText);
          
          if (errorText && errorText.includes('Preenchimento incorreto')) {
            hasSpecificError = true;
            errorMessage = errorText.trim();
            console.log('❌ ERRO ESPECÍFICO DETECTADO:', errorMessage);
          }
        }
      } catch (error) {
        console.log('Elemento #spErro não encontrado (isso é ok)');
      }
      
      // 2. SEGUNDO: Se não há erro, aguardar 4s e verificar campos de sucesso
      let success = false;
      let finalMessage = '';
      
      if (hasSpecificError) {
        // Se encontrou erro específico, é FALHA
        success = false;
        finalMessage = `FALHA - ${errorMessage}`;
        console.log('Resultado: FALHA (erro específico #spErro detectado)');
      } else {
        // Se não há erro, aguardar 4s e verificar campos de sucesso
        console.log('Nenhum erro detectado. Aguardando 4s para verificar campos de sucesso...');
        await page.waitForTimeout(4000);
        
        // Verificar campos de sucesso: nomeResposta e dNascResposta
        let hasSuccessFields = false;
        
        try {
          console.log('Procurando campo nomeResposta (#nomeResposta)...');
          const nomeRespostaField = await page.locator('#nomeResposta');
          const nomeRespostaCount = await nomeRespostaField.count();
          
          console.log('Procurando campo dNascResposta (#dNascResposta)...');
          const dNascRespostaField = await page.locator('#dNascResposta');
          const dNascRespostaCount = await dNascRespostaField.count();
          
          if (nomeRespostaCount > 0 && dNascRespostaCount > 0) {
            hasSuccessFields = true;
            console.log('✅ CAMPOS DE SUCESSO DETECTADOS: nomeResposta e dNascResposta');
            console.log('✅ Isso indica que o cadastro foi realizado com sucesso!');
          } else {
            console.log('❌ Campos de sucesso não encontrados');
            console.log(`nomeResposta encontrado: ${nomeRespostaCount > 0}`);
            console.log(`dNascResposta encontrado: ${dNascRespostaCount > 0}`);
          }
        } catch (error) {
          console.log('❌ Erro ao verificar campos de sucesso:', error);
        }
        
        if (hasSuccessFields) {
          success = true;
          finalMessage = 'SUCESSO - Campos de resposta encontrados (cadastro realizado)';
          console.log('Resultado: SUCESSO (campos de resposta detectados)');
        } else {
          // Se não encontrou campos de sucesso, verificar outras indicações
          const currentUrl = page.url();
          const pageContent = await page.content();
          
          // Verificar se há mensagens de erro genéricas
          const hasGenericError = pageContent.toLowerCase().includes('erro') || 
                                  pageContent.toLowerCase().includes('inválido') ||
                                  pageContent.toLowerCase().includes('error') ||
                                  pageContent.toLowerCase().includes('não encontrado') ||
                                  pageContent.toLowerCase().includes('falha');
          
          // Verificar se houve redirecionamento (geralmente indica sucesso)
          const hasRedirect = currentUrl !== url;
          
          if (hasGenericError) {
            success = false;
            finalMessage = 'FALHA - Erro detectado no formulário';
            console.log('Resultado: FALHA (erro genérico detectado)');
          } else if (hasRedirect) {
            success = true;
            finalMessage = 'SUCESSO - Redirecionamento detectado';
            console.log('Resultado: SUCESSO (redirecionamento detectado)');
          } else {
            success = false;
            finalMessage = 'FALHA - Nenhum indicador de sucesso encontrado';
            console.log('Resultado: FALHA (nenhum indicador de sucesso)');
          }
        }
      }
      
            // Screenshot desabilitado para produção
            console.log('Screenshot final desabilitado para produção');
            // await page.screenshot({ path: `resultado-${success ? 'sucesso' : 'falha'}-${Date.now()}.png` });
      
      await browser.close();
      
      return NextResponse.json({ 
        success,
        message: finalMessage
      });

    } catch (error) {
      await browser.close();
      throw error;
    }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Erro completo na automação:', error);
          console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
          return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
          );
        }
}

