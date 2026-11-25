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

const story = document.getElementById('experiencia');
const scene = document.getElementById('scene');
const workstation = document.getElementById('workstation');
const screen = document.getElementById('screen');
const featuredPreview = document.getElementById('featured-preview');
const featuredLink = document.getElementById('featured-link');
const toolbar = document.getElementById('toolbar');
const dialog = document.getElementById('preview-dialog');
const dialogPreview = document.getElementById('dialog-preview');
const projectNav = Array.from(document.querySelectorAll('[data-scene-project]'));
const lightButtons = Array.from(document.querySelectorAll('[data-light]'));
const deviceButtons = Array.from(screen.querySelectorAll('[data-device]'));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const compact = matchMedia('(max-width: 760px)');
const motionState = { progress: 0, hoverX: 0, hoverY: 0, dragX: 0, dragY: 0, pointer: null, dragging: false };
const lightOptions = { violet: '#a075ff', blue: '#56a5f7' };
let selectedLight = 'auto';
let selectedDevice = 'desktop';
let activeIndex = -1;
let framePending = false;

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

function setLighting() {
  scene.style.setProperty('--ambient', lightOptions[selectedLight] || projects[activeIndex].light);
  lightButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.light === selectedLight)));
}
function selectDevice(device) {
  if (selectedDevice === device) return;
  selectedDevice = device;
  featuredPreview.classList.toggle('device-phone', device === 'phone');
  deviceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === device)));
  if (!reducedMotion.matches) {
    featuredPreview.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  }
}
function selectProject(index) {
  if (activeIndex === index) return;
  activeIndex = index;
  const project = projects[index];
  document.getElementById('featured-category').textContent = project.category;
  document.getElementById('featured-name').textContent = project.name;
  document.getElementById('featured-description').textContent = project.summary;
  featuredLink.href = project.url;
  projectNav.forEach((item, navIndex) => {
    if (navIndex === index) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  });

  renderDemo(featuredPreview, project, true);
  if (!reducedMotion.matches) {
    featuredPreview.animate([{ opacity: .4, transform: 'scale(1.025)' }, { opacity: 1, transform: 'none' }],
      { duration: 400, easing: 'cubic-bezier(.16,.62,.33,1)' });
  }
  setLighting();
}

function storyRange() {
  return Math.max(0, story.offsetHeight - scene.offsetHeight);
}
function jumpToProject(index) {
  const normalized = (index + projects.length) % projects.length;
  const range = storyRange();
  if (range > 0 && !reducedMotion.matches) {
    window.scrollTo({ top: story.offsetTop + (normalized / (projects.length - 1)) * range, behavior: 'instant' });
  }
  selectProject(normalized);
  requestFrame();
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function paintFrame() {
  framePending = false;
  const range = storyRange();
  const useScroll = range > 0 && !reducedMotion.matches;
  if (useScroll && !dialog.open) {
    motionState.progress = clamp((scrollY - story.offsetTop) / range, 0, 1);
    selectProject(Math.round(motionState.progress * (projects.length - 1)));
  }
  const progress = useScroll ? motionState.progress : activeIndex / (projects.length - 1);
  const angle = progress * 3 * Math.PI;
  const wave = reducedMotion.matches ? 0 : Math.sin(angle);
  const swing = reducedMotion.matches ? 0 : -12 * Math.cos(angle);
  const size = compact.matches ? .56 : 1;

  scene.style.setProperty('--rx', (-3 + wave * 6 * size + motionState.hoverX + motionState.dragX) + 'deg');
  scene.style.setProperty('--ry', (swing * size + motionState.hoverY + motionState.dragY) + 'deg');
  scene.style.setProperty('--lift', (-Math.abs(wave) * 15 * size) + 'px');
  scene.style.setProperty('--depth', (Math.abs(wave) * 15 * size) + 'px');
  scene.style.setProperty('--zoom', String(1 + Math.abs(wave) * .045 * size));
  scene.style.setProperty('--bg-shift', (reducedMotion.matches ? 0 : (progress - .5) * 26) + 'px');
  toolbar.style.setProperty('--story-progress', String(.25 + progress * .75));
}
function requestFrame() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(paintFrame);
}

function showDemo(index, paneIndex = 0, device = 'desktop') {
  if (typeof dialog.showModal !== 'function') return false;
  const project = projects[index];
  document.getElementById('dialog-title').textContent = project.name;
  document.getElementById('dialog-summary').textContent = project.summary;
  document.getElementById('dialog-link').href = project.url;
  dialogPreview.classList.toggle('device-phone', device === 'phone');
  renderDemo(dialogPreview, project, true, paneIndex);
  dialog.showModal();
  dialog.scrollTop = 0;
  return true;
}

projectNav.forEach((link, index) => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  jumpToProject(index);
}));
document.getElementById('previous-project').addEventListener('click', () => jumpToProject(activeIndex - 1));
document.getElementById('next-project').addEventListener('click', () => jumpToProject(activeIndex + 1));
function openFeaturedDemo() {
  return showDemo(activeIndex, Number(featuredPreview.dataset.pane), selectedDevice);
}

document.getElementById('expand-preview').addEventListener('click', openFeaturedDemo);
featuredLink.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (openFeaturedDemo()) event.preventDefault();
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
lightButtons.forEach(button => button.addEventListener('click', () => {
  selectedLight = button.dataset.light;
  setLighting();
}));
deviceButtons.forEach(button => button.addEventListener('click', () => selectDevice(button.dataset.device)));

projects.forEach((project, index) => {
  renderDemo(project.card.querySelector('.card-preview'), project, false);
  const trigger = project.card.querySelector('.card-demo');
  trigger.hidden = typeof dialog.showModal !== 'function';
  trigger.addEventListener('click', () => showDemo(index));
});

document.getElementById('reset-camera').addEventListener('click', () => {
  motionState.dragX = 0;
  motionState.dragY = 0;
  motionState.hoverX = 0;
  motionState.hoverY = 0;
  requestFrame();
});

workstation.addEventListener('pointermove', event => {
  if (motionState.pointer !== null || !finePointer.matches || reducedMotion.matches) return;
  const box = workstation.getBoundingClientRect();
  motionState.hoverX = (.5 - (event.clientY - box.top) / box.height) * 6;
  motionState.hoverY = ((event.clientX - box.left) / box.width - .5) * 9;
  requestFrame();
});
workstation.addEventListener('pointerleave', () => {
  motionState.hoverX = 0;
  motionState.hoverY = 0;
  requestFrame();
});
screen.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !event.isPrimary || event.target.closest('button, a')) return;
  motionState.pointer = event.pointerId;
  motionState.originX = event.clientX;
  motionState.originY = event.clientY;
  motionState.baseX = motionState.dragX;
  motionState.baseY = motionState.dragY;
  screen.setPointerCapture(event.pointerId);
});
screen.addEventListener('pointermove', event => {
  if (motionState.pointer !== event.pointerId) return;
  const dx = event.clientX - motionState.originX;
  const dy = event.clientY - motionState.originY;
  if (!motionState.dragging && Math.abs(dx) + Math.abs(dy) < 5) return;
  motionState.dragging = true;
  workstation.classList.add('is-dragging');
  motionState.dragX = clamp(motionState.baseX - dy * .13, -22, 22);
  motionState.dragY = clamp(motionState.baseY + dx * .16, -34, 34);
  motionState.hoverX = 0;
  motionState.hoverY = 0;
  requestFrame();
});

function finishDrag(event) {
  if (motionState.pointer !== event.pointerId) return;
  motionState.pointer = null;
  motionState.dragging = false;
  workstation.classList.remove('is-dragging');
}
screen.addEventListener('lostpointercapture', finishDrag);
screen.addEventListener('pointercancel', finishDrag);

const keyboard = document.getElementById('keyboard');
keyboard.replaceChildren(...Array.from({ length: 61 }, () => make('i')));
document.getElementById('year').textContent = new Date().getFullYear();
addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', requestFrame, { passive: true });
reducedMotion.addEventListener('change', requestFrame);
story.classList.add('is-ready');
toolbar.hidden = false;
screen.querySelector('.device-controls').hidden = false;
selectProject(0);
paintFrame();
