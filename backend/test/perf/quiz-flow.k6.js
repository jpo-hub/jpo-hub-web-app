/**
 * Test de charge k6 — parcours candidat complet du HUB JPO
 *
 * Simule le scénario réel d'une Journée Portes Ouvertes : des candidats
 * arrivent progressivement, consultent le quiz, s'inscrivent, répondent
 * et consultent leurs résultats. Un pic simule le rush après une
 * présentation d'amphi.
 *
 * Usage :
 *   k6 run test/perf/quiz-flow.k6.js                     # test complet (~2min15)
 *   k6 run -e SMOKE=1 test/perf/quiz-flow.k6.js          # smoke test rapide (30s)
 *   k6 run -e BASE_URL=http://autre-hote:3000 ...        # autre environnement
 *
 * Après le test, nettoyer les données générées :
 *   docker exec -i backend-jpo-hub-db psql -U jpo-hub -d jpo-hub-db < test/perf/cleanup.sql
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

const fullScenario = {
  jpo_rush: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 10 }, // ouverture des portes : arrivée progressive
      { duration: '60s', target: 30 }, // charge nominale : 30 candidats simultanés
      { duration: '30s', target: 60 }, // pic : rush après une présentation d'amphi
      { duration: '15s', target: 0 },  // fin de journée
    ],
  },
};

const smokeScenario = {
  smoke: {
    executor: 'constant-vus',
    vus: 2,
    duration: '30s',
  },
};

export const options = {
  scenarios: __ENV.SMOKE ? smokeScenario : fullScenario,
  thresholds: {
    // Critères d'acceptation : moins de 1% d'erreurs, 95% des requêtes
    // sous 500ms, aucune au-delà de 1,5s
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    // Les écritures (inscription, soumission) ont un budget dédié
    'http_req_duration{step:inscription}': ['p(95)<800'],
    'http_req_duration{step:soumission}': ['p(95)<800'],
    checks: ['rate>0.99'],
  },
};

// Exécuté une seule fois : identifiant de run pour garantir des emails
// uniques entre deux lancements (sinon conflit sur la contrainte unique)
export function setup() {
  return { runId: Date.now().toString(36) };
}

export default function (data) {
  let filieres = [];
  let candidatUid = null;

  group('01 - Consultation du quiz', () => {
    const resFilieres = http.get(`${BASE_URL}/filieres`, {
      tags: { step: 'consultation' },
    });
    check(resFilieres, {
      'filières récupérées (200)': (r) => r.status === 200,
      'au moins une filière': (r) => r.json().length > 0,
    });
    filieres = resFilieres.json();

    const resQuestions = http.get(`${BASE_URL}/questions`, {
      tags: { step: 'consultation' },
    });
    check(resQuestions, {
      'questions récupérées (200)': (r) => r.status === 200,
    });
  });

  // Le candidat lit la première question
  sleep(Math.random() * 2 + 1);

  group('02 - Inscription du candidat', () => {
    const payload = JSON.stringify({
      email: `k6-${data.runId}-vu${__VU}-iter${__ITER}@loadtest.local`,
      firstname: `Load${__VU}`,
      lastname: `TEST${__ITER}`,
      ageRange: '15-17',
      appointment: false,
      consentement: true,
    });

    const res = http.post(`${BASE_URL}/candidats`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { step: 'inscription' },
    });

    check(res, {
      'candidat créé (201)': (r) => r.status === 201,
      'uid retourné': (r) => Boolean(r.json('uid')),
      'email normalisé en minuscules': (r) =>
        r.json('email') === r.json('email').toLowerCase(),
    });
    candidatUid = res.json('uid');
  });

  if (!candidatUid) return;

  // Le candidat répond aux questions du quiz
  sleep(Math.random() * 3 + 2);

  group('03 - Soumission des réponses', () => {
    // Scores aléatoires sur les filières réelles, comme le fait le front
    const scores = {};
    for (const filiere of filieres) {
      scores[filiere.label] = Math.floor(Math.random() * 5);
    }

    const res = http.post(
      `${BASE_URL}/answers/traitement/${candidatUid}`,
      JSON.stringify({ filieres: scores }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { step: 'soumission' },
      },
    );

    check(res, {
      'scores enregistrés (201)': (r) => r.status === 201 || r.status === 200,
    });
  });

  sleep(1);

  group('04 - Consultation des résultats', () => {
    const res = http.get(`${BASE_URL}/scoring/${candidatUid}`, {
      tags: { step: 'resultats' },
    });
    check(res, {
      'résultats calculés (200)': (r) => r.status === 200,
    });
  });

  // Le candidat lit ses résultats avant de rendre la tablette
  sleep(Math.random() * 2 + 1);
}
