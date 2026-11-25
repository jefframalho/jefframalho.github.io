'use strict';

const demoData = {
  clinix: {
    brand: 'Clinix Odonto',
    light: '#6ca0d9',
    chart: ['Consultas na semana', 4, 6, 5, 8, 6, 3, 2],
    panes: [
      {
        label: 'Agenda', name: 'Agenda da clínica', detail: 'Hoje na clínica',
        metrics: [['Consultas','8'],['Confirmadas','6'],['A confirmar','2']],
        rows: [['09:00','Avaliação odontológica','Confirmada'],['10:30','Limpeza e profilaxia','Em atendimento'],['14:00','Retorno de tratamento','A confirmar']]
      },
      {
        label: 'Prontuário', name: 'Prontuário odontológico', detail: 'Registros recentes',
        metrics: [['Pacientes','24'],['Atendimentos','18'],['Retornos','6']],
        rows: [['Hoje','Avaliação inicial','Registrada'],['Ontem','Revisão do odontograma','Atualizada'],['Seg','Acompanhamento','Agendado']]
      },
      {
        label: 'Contratos', name: 'Contratos da clínica', detail: 'Acompanhamento',
        metrics: [['Contratos','12'],['Assinados','9'],['Pendentes','3']],
        rows: [['Hoje','Tratamento odontológico','Assinado'],['Ontem','Plano de tratamento','Enviado'],['Seg','Termo de consentimento','Em revisão']]
      }
    ]
  },
  advera: {
    brand: 'Advera',
    light: '#a58c72',
    chart: ['Prazos por dia', 3, 5, 4, 7, 4, 2, 1],
    panes: [
      {
        label: 'Prazos', name: 'Prazos processuais', detail: 'Próximos compromissos',
        metrics: [['Esta semana','7'],['Prioritários','2'],['Concluídos','14']],
        rows: [['Hoje','Revisão de contestação','Prioritário'],['Amanhã','Análise de intimação','Em análise'],['Sex','Preparação de audiência','Agendado']]
      },
      {
        label: 'Processos', name: 'Processos do escritório', detail: 'Andamentos recentes',
        metrics: [['Ativos','18'],['Andamentos','5'],['Encerrados','7']],
        rows: [['Hoje','Consulta de andamento','Atualizado'],['Ontem','Documentação do caso','Em análise'],['Seg','Petição protocolada','Registrado']]
      },
      {
        label: 'Honorários', name: 'Controle de honorários', detail: 'Parcelas do mês',
        metrics: [['Recebidas','8'],['A receber','4'],['Vencidas','1']],
        rows: [['Hoje','Honorários contratuais','Recebido'],['Qui','Parcela de acompanhamento','A receber'],['Sex','Honorários de consultoria','A receber']]
      }
    ]
  },
  viver: {
    brand: 'Viver Bem',
    light: '#6589e1',
    chart: ['Plantões na semana', 5, 4, 6, 5, 7, 4, 3],
    panes: [
      {
        label: 'Plantões', name: 'Plantões do dia', detail: 'Atendimentos domiciliares',
        metrics: [['Plantões','5'],['Em curso','2'],['Concluídos','3']],
        rows: [['08:00','Visita de enfermagem','Concluída'],['10:00','Acompanhamento domiciliar','Em curso'],['14:30','Visita programada','Agendada']]
      },
      {
        label: 'Check-ins', name: 'Chegadas e saídas', detail: 'Registro de visitas',
        metrics: [['Chegadas','8'],['Saídas','6'],['Em visita','2']],
        rows: [['08:02','Chegada da equipe','Registrada'],['09:16','Saída após atendimento','Registrada'],['10:04','Chegada para visita','Registrada']]
      },
      {
        label: 'Família', name: 'Portal da família', detail: 'Atualizações do atendimento',
        metrics: [['Visitas','3'],['Próximas','2'],['Avisos','1']],
        rows: [['Hoje','Resumo do acompanhamento','Disponível'],['Hoje','Próxima visita da equipe','Agendada'],['Ontem','Registro de atendimento','Disponível']]
      }
    ]
  },
  evolui: {
    brand: 'Evolui Fit',
    light: '#7ea172',
    chart: ['Séries por dia', 8, 5, 12, 9, 16, 10, 4],
    panes: [
      {
        label: 'Treino', name: 'Meu treino de hoje', detail: 'Ficha de treino',
        metrics: [['Exercícios','5'],['Séries','16'],['Concluídos','2']],
        rows: [['3 × 12','Leg press','Concluído'],['3 × 10','Supino com halteres','Concluído'],['4 × 10','Remada sentada','Próximo']]
      },
      {
        label: 'Cargas', name: 'Histórico de cargas', detail: 'Registros de exercício',
        metrics: [['Registros','12'],['Exercícios','5'],['Esta semana','4']],
        rows: [['Hoje','Leg press','60 kg'],['Hoje','Supino com halteres','12 kg'],['Seg','Remada sentada','25 kg']]
      },
      {
        label: 'Metas', name: 'Minhas metas', detail: 'Progresso da semana',
        metrics: [['Treinos','3 / 4'],['Metas','2'],['Em curso','1']],
        rows: [['Semana','Treinar quatro vezes','Em curso'],['Mês','Registrar cargas','Em dia'],['Mês','Acompanhar medidas','Em dia']]
      }
    ]
  }
};

const svgNS = 'http://www.w3.org/2000/svg';
function make(tag, classes, label) {
  const element = document.createElement(tag);
  if (classes) element.className = classes;
  if (label !== undefined) element.textContent = label;
  return element;
}
function icon(name) {
  const svg = document.createElementNS(svgNS, 'svg');
  const use = document.createElementNS(svgNS, 'use');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', '#i-' + name);
  svg.append(use);
  return svg;
}

function renderDemo(mount, project, interactive, initialPane = 0) {
  const app = make('div', 'product-preview');
  app.dataset.product = project.id;

  const titleBar = make('div', 'preview-titlebar');
  const dots = make('span', 'dots');
  dots.setAttribute('aria-hidden', 'true');
  dots.append(make('i'), make('i'), make('i'));
  titleBar.append(dots, make('span', '', project.name), make('span', '', 'Demonstração'));

  const layout = make('div', 'preview-layout');
  const sidebar = make('div', 'preview-sidebar');
  const brand = make('div', 'preview-brand');
  brand.append(icon(project.id), make('span', '', project.brand));

  const tabs = make('div', 'preview-tabs');
  if (interactive) {
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Módulos da demonstração');
  }
  const paneBody = make('div', 'preview-main');
  if (interactive) paneBody.setAttribute('aria-live', 'polite');

  const paneControls = project.panes.map((pane, index) => {
    const control = make(interactive ? 'button' : 'span', 'preview-tab', pane.label);
    if (interactive) {
      control.type = 'button';
      control.addEventListener('click', () => selectPane(index, true));
    }
    tabs.append(control);
    return control;
  });

  const activity = make('div', 'preview-activity');
  const [chartTitle, ...chartValues] = project.chart;
  const bars = make('div', 'preview-bars');
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const peak = Math.max(...chartValues);
  bars.setAttribute('role', 'img');
  bars.setAttribute('aria-label', chartTitle + '. ' + days.map((day, i) => day + ' ' + chartValues[i]).join(', '));
  chartValues.forEach((value, index) => {
    const bar = make('span', '', days[index]);
    bar.style.setProperty('--bar-height', (value / peak) * 100 + '%');
    bars.append(bar);
  });
  activity.append(make('strong', '', chartTitle), bars);

  function selectPane(index, animate = false) {
    const pane = project.panes[index];
    mount.dataset.pane = String(index);
    const heading = make('div', 'preview-main-heading');
    heading.append(make('p', '', project.category), make('h3', '', pane.name));

    const kpis = make('div', 'preview-kpis');
    for (const [label, value] of pane.metrics) {
      const metric = make('div', 'preview-kpi');
      metric.append(make('span', '', label), make('b', '', value));
      kpis.append(metric);
    }

    const list = make('div', 'preview-report');
    const listHeading = make('div', 'preview-report-header');
    listHeading.append(make('strong', '', pane.detail));
    list.append(listHeading);
    for (const [when, task, status] of pane.rows) {
      const row = make('div', 'preview-row');
      row.append(make('span', 'preview-when', when), make('span', 'preview-task', task), make('small', '', status));
      list.append(row);
    }

    paneControls.forEach((button, controlIndex) => {
      button.setAttribute('aria-pressed', String(controlIndex === index));
    });
    paneBody.replaceChildren(heading, kpis, list);
    if (index === 0) paneBody.append(activity);

    if (animate && !reducedMotion.matches) {
      paneBody.animate([{ opacity: .56, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 280, easing: 'cubic-bezier(.2,.65,.28,1)' });
    }
  }

  sidebar.append(brand, tabs);
  layout.append(sidebar, paneBody);
  app.append(titleBar, layout);
  selectPane(initialPane);
  mount.replaceChildren(app);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const dialog = document.getElementById('preview-dialog');
const dialogPreview = document.getElementById('dialog-preview');

const projects = Array.from(document.querySelectorAll('[data-project]'), card => {
  const id = card.dataset.project;
  return {
    id,
    name: card.querySelector('h3').textContent,
    category: card.querySelector('.card-category').textContent,
    summary: card.querySelector('.card-copy p').textContent,
    url: card.querySelector('.card-actions a').href,
    card,
    ...demoData[id]
  };
});

// Demos dos cards do catálogo e diálogo de demonstração
function showDemo(index, paneIndex = 0) {
  if (typeof dialog.showModal !== 'function') return false;
  const project = projects[index];
  document.getElementById('dialog-title').textContent = project.name;
  document.getElementById('dialog-summary').textContent = project.summary;
  document.getElementById('dialog-link').href = project.url;
  renderDemo(dialogPreview, project, true, paneIndex);
  dialog.showModal();
  dialog.scrollTop = 0;
  return true;
}
projects.forEach((project, index) => {
  renderDemo(project.card.querySelector('.card-preview'), project, false);
  const trigger = project.card.querySelector('.card-demo');
  trigger.hidden = typeof dialog.showModal !== 'function';
  trigger.addEventListener('click', () => showDemo(index));
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});

// ---- Monitor 3D: vídeo de fundo + demo interativa projetada na tela ----
const hero = document.getElementById('hero');
const video = document.getElementById('monitor-video');
const layer = document.getElementById('screen-layer');
const featuredPreview = document.getElementById('featured-preview');
const stage = document.getElementById('stage');
const compactView = matchMedia('(max-width: 760px)');
let activeIndex = -1;

// Área da tela do monitor no vídeo (1440x1080), medida em dois momentos.
// Ordem: topo-esq, topo-dir, base-dir, base-esq.
const KEY = [
  { t: 4,  q: [[470,283],[970,283],[970,562],[470,562]] },
  { t: 6,  q: [[142,154],[1300,154],[1300,807],[142,807]] },
  { t: 9,  q: [[37,113],[1404,113],[1404,884],[37,884]] },
  { t: 12, q: [[-20,88],[1460,88],[1460,918],[-20,918]] },
  { t: 14, q: [[-40,88],[1480,88],[1480,935],[-40,935]] },
  { t: 20, q: [[137,103],[1262,242],[1276,912],[120,826]] }
];
const LW = 1280, LH = 720;
const SRC = [[0,0],[LW,0],[LW,LH],[0,LH]];

function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}
function homography(src, dst) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
  }
  return solve(A, b);
}
function matrix3d(h) {
  const [h0, h1, h2, h3, h4, h5, h6, h7] = h;
  return `matrix3d(${h0},${h3},0,${h6},${h1},${h4},0,${h7},0,0,1,0,${h2},${h5},0,1)`;
}
const ease = t => t * t * (3 - 2 * t);
function quadAt(t) {
  let i = 0;
  while (i < KEY.length - 2 && t > KEY[i + 1].t) i++;
  const a = KEY[i], b = KEY[i + 1];
  const f = ease(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  return a.q.map((p, k) => [p[0] + (b.q[k][0] - p[0]) * f, p[1] + (b.q[k][1] - p[1]) * f]);
}

function selectProject(index) {
  activeIndex = (index + projects.length) % projects.length;
  const project = projects[activeIndex];
  document.getElementById('featured-category').textContent = project.category;
  document.getElementById('featured-name').textContent = project.name;
  document.getElementById('featured-link').href = project.url;
  renderDemo(featuredPreview, project, true);
}

function fit() {
  const s = Math.min(innerWidth / 1440, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth - 1440 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
}
addEventListener('resize', fit);
fit();

function paint() {
  const t = video.currentTime;
  const inside = t >= KEY[0].t && t <= KEY[KEY.length - 1].t;
  layer.classList.toggle('on', inside && !compactView.matches);
  if (inside && !compactView.matches) layer.style.transform = matrix3d(homography(SRC, quadAt(t)));
  if (!reducedMotion.matches) requestAnimationFrame(paint);
}

document.getElementById('previous-project').addEventListener('click', () => selectProject(activeIndex - 1));
document.getElementById('next-project').addEventListener('click', () => selectProject(activeIndex + 1));
document.getElementById('featured-open').addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  showDemo(activeIndex);
});
stage.addEventListener('click', event => {
  if (layer.contains(event.target)) return;
  video.paused ? video.play() : video.pause();
});
video.addEventListener('play', () => requestAnimationFrame(paint));
requestAnimationFrame(paint);

// Tela ocupa 1280x720 do palco; demo interativa aparece ao iniciar
featuredPreview.style.width = LW + 'px';
featuredPreview.style.height = LH + 'px';
selectProject(0);
if (reducedMotion.matches) video.pause();

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
hero.classList.add('is-ready');
