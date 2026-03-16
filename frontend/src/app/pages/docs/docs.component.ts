import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="docs-container fade-in">
      <header class="docs-header">
        <button mat-icon-button routerLink="/home" aria-label="Voltar para home" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="article-title gradient-text">A Ciência por trás do Ciclo do Sono e do somnitide</h1>
        <p class="article-meta">Neste artigo você verá um guia completo sobre a arquitetura do sono, inércia do despertar e a nossa metodologia de pontuação.</p>
        <div class="article-divider"></div>
      </header>

      <article class="docs-content">
        <!-- Introduction -->
        <section class="doc-section">
          <p class="lead-text">
            O somnitide foi projetado com base em princípios fundamentais da cronobiologia e medicina do sono. 
            Nosso objetivo é fornecer ao usuário não apenas um despertador, mas uma ferramenta de otimização baseada 
            na alternância rítmica das fases cerebrais durante o descanso.
          </p>
        </section>

        <!-- Section 1: Sleep Architecture -->
        <section class="doc-section">
          <h2>1. A Arquitetura do Sono: Estágios e Ciclos</h2>
          <p>
            O sono humano é um processo biológico complexo e altamente estruturado, dividido em dois tipos principais: 
            <strong>NREM</strong> (Non-Rapid Eye Movement) e <strong>REM</strong> (Rapid Eye Movement). 
            A transição entre esses estados ocorre em ciclos recorrentes ao longo da noite.
          </p>

          <div class="article-grid">
            <div class="article-column">
              <h3>Fases NREM (N1, N2, N3)</h3>
              <p>
                As fases N1 e N2 representam o sono leve, onde a atividade cerebral começa a desacelerar. 
                O estágio <strong>N3</strong>, também conhecido como "sono de ondas lentas" ou sono profundo, 
                é o momento crucial para a restauração física, liberação de hormônios de crescimento e reparação tecidual.
              </p>
            </div>
            <div class="article-column">
              <h3>A Fase REM</h3>
              <p>
                O sono REM é caracterizado por intensa atividade cerebral, similar ao estado de vigília. 
                É nesta fase que ocorrem os sonhos vívidos e o processamento emocional. O REM desempenha um papel 
                vital na consolidação da memória e na saúde cognitiva.
              </p>
            </div>
          </div>

          <p>
            Um ciclo completo (N1 &rarr; N2 &rarr; N3 &rarr; REM) dura em média de <strong>80 a 110 minutos</strong>. 
            Em uma noite saudável, passamos por 4 a 6 desses ciclos. É fundamental notar que a composição dos ciclos 
            muda: o sono profundo predomina nos primeiros ciclos, enquanto o sono REM torna-se mais longo e frequente 
            nos ciclos finais, próximos ao amanhecer.
          </p>
          <p class="source-citation">Fonte: NIH/NHLBI - How Sleep Works & NINDS - Brain Basics.</p>
        </section>

        <!-- Section 2: Sleep Inertia -->
        <section class="doc-section">
          <h2>2. Sleep Inertia: O Desafio de Acordar</h2>
          <p>
            A transição do sono para o estado de alerta pleno não é instantânea. A ciência denomina este período 
            de <strong>Sleep Inertia</strong> (Inércia do Sono). Trata-se de um estado de confusão mental, 
            atenção reduzida e desempenho cognitivo prejudicado que ocorre imediatamente após o despertar.
          </p>
          <p>
            Estudos (Hilditch & Dorrian, 2019) indicam que a gravidade da inércia do sono é diretamente influenciada 
            pelo estágio em que você acorda. Despertar abruptamente durante o <strong>sono profundo (N3)</strong> 
            desencadeia uma inércia mais severa, fazendo com que você se sinta "grogue" por muito mais tempo.
          </p>
          <p>
            O somnitide utiliza algoritmos para sugerir janelas de despertar que coincidam com o final de um ciclo (geralmente após a fase REM), 
            minimizando a probabilidade de uma interrupção em sono profundo e facilitando a transição para a vigília ativa.
          </p>
        </section>

        <!-- Section 3: Methodology & Ranking -->
        <section class="doc-section methodology">
          <h2>3. Algoritmo de Pontuação e Ranking</h2>
          <p>
            O Ranking do somnitide não é uma corrida de quem dorme mais, mas sim um medidor de <strong>Eficiência e Mentalidade de Sono</strong>. 
            Sua pontuação diária é calculada através de três pilares fundamentais, totalizando até <strong>110 pontos</strong> por sessão.
          </p>

          <div class="ranking-math-container">
            <div class="math-card">
              <div class="math-header">Duração (Até 60 pts)</div>
              <p>Premiamos a permanência na janela ideal de saúde (6 a 9 horas).</p>
              <ul class="math-list">
                <li><strong>6h a 9h:</strong> 60 pontos (Pontuação Máxima)</li>
                <li><strong>3h a 6h:</strong> Pontuação proporcional (ex: 4.5h = 20 pts)</li>
                <li><strong>Mais de 9h:</strong> Penalidade leve (Inércia do sono prolongado)</li>
                <li><strong>Menos de 3h:</strong> 0 pontos (Duração crítica)</li>
              </ul>
            </div>

            <div class="math-card">
              <div class="math-header">Qualidade (Até 40 pts)</div>
              <p>Sua percepção subjetiva informada no despertar.</p>
              <ul class="math-list">
                <li><strong>Ótima (5 estrelas):</strong> 40 pontos</li>
                <li><strong>Boa:</strong> 30 pontos | <strong>Regular:</strong> 20 pts</li>
                <li><strong>Ruim:</strong> 10 pts | <strong>Péssima:</strong> 0 pts</li>
              </ul>
            </div>

            <div class="math-card">
              <div class="math-header">Constância (Até 10 pts)</div>
              <p>Bônus de Streak para quem mantém o hábito.</p>
              <ul class="math-list">
                <li><strong>14+ dias seguidos:</strong> +10 pontos</li>
                <li><strong>7 a 13 dias:</strong> +8 pontos</li>
                <li><strong>2 a 6 dias:</strong> +2 a +6 pontos</li>
              </ul>
            </div>
          </div>

          <div class="example-box">
            <h4>Exemplo Prático de Pontuação</h4>
            <p>
              O usuário <strong>@chico</strong> dormiu <strong>7 horas e 30 minutos</strong> (ponto ideal), avaliou seu sono como 
              <strong>"Ótimo"</strong> e está em seu <strong>15º dia seguido</strong> usando o app:
            </p>
            <div class="calculation-row">
              <span>60 (Duração) + 40 (Qualidade) + 10 (Bônus)</span>
              <span class="total-result">= 110 Pontos</span>
            </div>
            <p class="example-note">Este é o "Perfect Score" que leva os usuários ao topo do Ranking Global.</p>
          </div>
        </section>

        <section class="doc-footer">
          <p>
            <strong>Transparência Científica:</strong> somnitide não captura ondas cerebrais. 
            Somos um modelo matemático-estatístico baseado na literatura médica atual. 
            Para distúrbios crônicos, consulte sempre um especialista.
          </p>
        </section>
      </article>
    </div>
  `,
  styles: `
    .docs-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 24px;
      color: var(--color-text);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .docs-header {
      margin-bottom: 40px;
      text-align: left;
    }

    .back-btn {
      margin-left: -12px;
      margin-bottom: 24px;
      color: var(--color-primary);
    }

    .article-title {
      font-size: clamp(2.64rem, 11vw, 3.74rem);
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 24px;
      letter-spacing: -2px;
    }

    .article-meta {
      color: var(--color-text-muted);
      font-size: 1.05rem;
      line-height: 1.5;
      max-width: 600px;
    }

    .article-divider {
      width: 60px;
      height: 4px;
      background: var(--color-primary);
      margin: 32px 0;
      border-radius: 2px;
      opacity: 0.8;
    }

    .docs-content {
      line-height: 1.7;
      font-size: 0.95rem;
    }

    .doc-section {
      margin-bottom: 48px;
    }

    .lead-text {
      font-size: 1.1rem;
      color: var(--color-primary);
      font-weight: 500;
      opacity: 0.9;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 40px 0 24px 0;
      color: var(--color-text);
      letter-spacing: -0.02em;
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-primary);
    }

    p {
      margin-bottom: 20px;
      color: var(--color-text-muted2, rgba(255, 255, 255, 0.7));
    }

    .article-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin: 32px 0;
      background: rgba(255, 255, 255, 0.02);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .source-citation {
      font-size: 0.75rem;
      font-style: italic;
      color: var(--color-primary);
      opacity: 0.6;
      margin-top: -12px;
    }

    .methodology {
      background: linear-gradient(135deg, rgba(66, 214, 198, 0.05) 0%, transparent 100%);
      padding: 32px;
      border-radius: 16px;
      border: 1px solid rgba(66, 214, 198, 0.1);
    }

    .ranking-math-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin: 24px 0;
    }

    .math-card {
      background: rgba(17, 24, 38, 0.4);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .math-header {
      color: var(--color-primary);
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .math-list {
      padding: 0;
      list-style: none;
      margin: 12px 0 0 0;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .math-list li {
      margin-bottom: 8px;
    }

    .example-box {
      margin-top: 32px;
      background: rgba(66, 214, 198, 0.1);
      padding: 24px;
      border-radius: 12px;
      border: 1px dashed var(--color-primary);
    }

    .example-box h4 {
      margin: 0 0 12px 0;
      color: var(--color-text);
      font-weight: 700;
    }

    .calculation-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-surface);
      padding: 12px 20px;
      border-radius: 8px;
      margin: 16px 0;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      border: 1px solid var(--color-border);
    }

    .total-result {
      color: var(--color-primary);
    }

    .example-note {
      font-size: 0.85rem;
      margin: 0;
      font-style: italic;
    }

    .doc-footer {
      margin-top: 60px;
      text-align: center;
    }

    .doc-footer p {
      font-size: 0.8rem;
      opacity: 0.5;
      max-width: 500px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .article-grid {
        grid-template-columns: 1fr;
      }
      .article-title {
        font-size: 1.7rem;
      }
      .docs-container {
        padding: 40px 20px;
      }
    }
  `
})
export class DocsComponent { }
