// Mock data for initiatives
import { Initiative } from '@/types/initiatives';

export const mockInitiatives: Initiative[] = [
  {
    id: 'init-001',
    title: 'Aborcja dostępna dla każdej kobiety do 18 tygodnia ciąży',
    summary: 'Inicjatywa zakłada umożliwienie dostępu do aborcji dla każdej kobiety w ciąży do 18 tygodnia bez podawania przyczyny. Dodatkowo wprowadza refundację zabiegu przez NFZ oraz gwarantuje dostęp do opieki psychologicznej.',
    category: 'social',
    tags: [
      { id: 'tag-001', name: 'Zdrowie' },
      { id: 'tag-002', name: 'Prawa Kobiet' },
      { id: 'tag-003', name: 'Medycyna' }
    ],
    author: {
      id: 'author-001',
      name: 'Donald Tusk',
      image: '/avatars/donald-tusk.jpg',
      title: 'Premier RP'
    },
    createdAt: '2025-01-20T14:32:00Z',
    votes: 420,
    comments: 237,
    views: 12750,
    supporters: 5271,
    templateSections: [
      {
        id: 'section-1',
        type: 'text',
        title: 'Kontekst prawny',
        content: 'Obecne przepisy znacząco ograniczają dostęp do legalnej aborcji w Polsce. Proponowane zmiany mają na celu dostosowanie prawa do standardów europejskich i zapewnienie kobietom prawa wyboru.',
        order: 0
      },
      {
        id: 'section-2',
        type: 'bullet-list',
        title: 'Główne założenia',
        content: [
          { id: 'bullet-1', text: 'Dostęp do aborcji na życzenie do 18 tygodnia ciąży' },
          { id: 'bullet-2', text: 'Pełna refundacja zabiegu przez NFZ' },
          { id: 'bullet-3', text: 'Zapewnienie dostępu do opieki psychologicznej' },
          { id: 'bullet-4', text: 'Edukacja w zakresie zdrowia reprodukcyjnego' }
        ],
        order: 1
      }
    ]
  },
  {
    id: 'init-002',
    title: 'Zwiększenie nakładów na obronność do 3,5% PKB',
    summary: 'Projekt zakłada zwiększenie nakładów na obronność do poziomu 3,5% PKB w związku z zagrożeniem ze wschodu i koniecznością unowocześnienia polskiej armii. Dodatkowe środki zostaną przeznaczone na zakup nowego sprzętu wojskowego oraz zwiększenie uposażeń żołnierzy zawodowych.',
    category: 'foreign',
    tags: [
      { id: 'tag-004', name: 'Obronność' },
      { id: 'tag-005', name: 'Wojsko' },
      { id: 'tag-006', name: 'Bezpieczeństwo' }
    ],
    author: {
      id: 'author-002',
      name: 'Władysław Kosiniak-Kamysz',
      image: '/avatars/wladyslaw-kosiniak-kamysz.jpg',
      title: 'Wicepremier, Minister Obrony Narodowej'
    },
    createdAt: '2025-01-18T09:45:00Z',
    votes: 318,
    comments: 142,
    views: 8932,
    supporters: 3420,
    templateSections: [
      {
        id: 'section-1',
        type: 'text',
        title: 'Uzasadnienie projektu',
        content: 'W obliczu rosnących napięć geopolitycznych i agresywnej polityki Rosji, konieczne jest wzmocnienie potencjału obronnego Polski. Zwiększenie nakładów na obronność do 3,5% PKB pozwoli na przyspieszenie modernizacji wojska i zwiększenie bezpieczeństwa państwa.',
        order: 0
      },
      {
        id: 'section-2',
        type: 'bullet-list',
        title: 'Planowane inwestycje',
        content: [
          { id: 'bullet-1', text: 'Zakup nowoczesnych systemów obrony przeciwlotniczej' },
          { id: 'bullet-2', text: 'Modernizacja floty czołgów i transporterów opancerzonych' },
          { id: 'bullet-3', text: 'Rozwój wojsk cybernetycznych' },
          { id: 'bullet-4', text: 'Zwiększenie uposażeń żołnierzy zawodowych' }
        ],
        order: 1
      }
    ]
  },
  {
    id: 'init-003',
    title: 'Modernizacja sieci kolejowej w Polsce Wschodniej',
    summary: 'Inicjatywa zakłada kompleksową modernizację sieci kolejowej w Polsce Wschodniej, w tym elektryfikację kluczowych linii oraz przywrócenie połączeń do miejscowości, które utraciły dostęp do transportu kolejowego. Projekt ma kluczowe znaczenie dla rozwoju gospodarczego regionu.',
    category: 'economic',
    tags: [
      { id: 'tag-007', name: 'Kolej' },
      { id: 'tag-008', name: 'Transport' },
      { id: 'tag-009', name: 'Infrastruktura' }
    ],
    author: {
      id: 'author-003',
      name: 'Dariusz Klimczak',
      image: '/avatars/dariusz-klimczak.jpg',
      title: 'Minister Infrastruktury'
    },
    createdAt: '2025-01-15T16:30:00Z',
    votes: 276,
    comments: 93,
    views: 7450,
    supporters: 2842,
    templateSections: [
      {
        id: 'section-1',
        type: 'text',
        title: 'Zakres projektu',
        content: 'Projekt przewiduje kompleksową modernizację linii kolejowych w województwach: podlaskim, lubelskim, podkarpackim oraz części mazowieckiego i świętokrzyskiego. Obejmuje elektryfikację linii, wymianę torów, modernizację stacji oraz przywrócenie połączeń do miejscowości odciętych od sieci kolejowej.',
        order: 0
      },
      {
        id: 'section-2',
        type: 'transcript',
        title: 'Konsultacje społeczne',
        content: {
          id: 'transcript-1',
          title: 'Wyniki konsultacji społecznych',
          content: 'Podczas konsultacji społecznych przeprowadzonych w okresie styczeń-luty 2025 r. mieszkańcy Polski Wschodniej wyrazili silne poparcie dla projektu modernizacji sieci kolejowej. Szczególnie podkreślano potrzebę przywrócenia połączeń do mniejszych miejscowości oraz zwiększenia częstotliwości kursowania pociągów.',
          source: 'Raport z konsultacji społecznych, Ministerstwo Infrastruktury, marzec 2025'
        },
        order: 1
      }
    ]
  },
  {
    id: 'init-004',
    title: 'Wprowadzenie podatku od nadmiernych zysków spółek energetycznych',
    summary: 'Projekt wprowadza tymczasowy podatek od nadzwyczajnych zysków spółek energetycznych, który ma na celu finansowanie dodatków energetycznych dla gospodarstw domowych. Pozyskane środki posłużą również do przyspieszenia transformacji energetycznej.',
    category: 'economic',
    tags: [
      { id: 'tag-010', name: 'Energia' },
      { id: 'tag-011', name: 'Podatki' },
      { id: 'tag-012', name: 'Gospodarka' }
    ],
    author: {
      id: 'author-004',
      name: 'Andrzej Domański',
      image: '/avatars/andrzej-domanski.jpg',
      title: 'Minister Finansów'
    },
    createdAt: '2025-01-10T11:15:00Z',
    votes: 194,
    comments: 208,
    views: 9320,
    supporters: 1721,
    templateSections: [
      {
        id: 'section-1',
        type: 'text',
        title: 'Mechanizm podatku',
        content: 'Proponowany podatek będzie naliczany od zysków przekraczających średni poziom z lat 2019-2022 o więcej niż 20%. Stawka podatku wyniesie 33% od nadwyżki. Podatek będzie obowiązywał przez okres 2 lat z możliwością przedłużenia w przypadku utrzymywania się wysokich cen energii.',
        order: 0
      },
      {
        id: 'section-2',
        type: 'bullet-list',
        title: 'Przeznaczenie środków',
        content: [
          { id: 'bullet-1', text: 'Dodatki energetyczne dla gospodarstw domowych o niskich dochodach' },
          { id: 'bullet-2', text: 'Wsparcie inwestycji w odnawialne źródła energii' },
          { id: 'bullet-3', text: 'Modernizacja sieci przesyłowych' },
          { id: 'bullet-4', text: 'Programy efektywności energetycznej' }
        ],
        order: 1
      }
    ]
  },
  {
    id: 'init-005',
    title: 'Obowiązkowe zajęcia z edukacji cyfrowej od pierwszej klasy szkoły podstawowej',
    summary: 'Inicjatywa zakłada wprowadzenie obowiązkowych zajęć z edukacji cyfrowej od pierwszej klasy szkoły podstawowej, które będą uczyć dzieci bezpiecznego korzystania z internetu, podstaw programowania oraz krytycznej analizy informacji znalezionych w sieci.',
    category: 'education',
    tags: [
      { id: 'tag-013', name: 'Edukacja' },
      { id: 'tag-014', name: 'Cyfryzacja' },
      { id: 'tag-015', name: 'Szkoła' }
    ],
    author: {
      id: 'author-005',
      name: 'Barbara Nowacka',
      image: '/avatars/barbara-nowacka.jpg',
      title: 'Minister Edukacji'
    },
    createdAt: '2025-01-05T13:20:00Z',
    votes: 245,
    comments: 125,
    views: 6250,
    supporters: 2932,
    templateSections: [
      {
        id: 'section-1',
        type: 'text',
        title: 'Program nauczania',
        content: 'Program nauczania edukacji cyfrowej będzie dostosowany do wieku uczniów i obejmie: podstawy bezpieczeństwa online, krytyczną analizę informacji, podstawy programowania i robotyki, etykę w sieci oraz praktyczne wykorzystanie technologii w nauce i życiu codziennym.',
        order: 0
      },
      {
        id: 'section-2',
        type: 'attachment',
        title: 'Materiały dodatkowe',
        content: [
          {
            id: 'attachment-1',
            name: 'Program nauczania edukacji cyfrowej',
            url: '/attachments/program-edukacji-cyfrowej.pdf',
            description: 'Szczegółowy program nauczania edukacji cyfrowej dla klas 1-8 szkoły podstawowej'
          },
          {
            id: 'attachment-2',
            name: 'Raport o kompetencjach cyfrowych dzieci',
            url: '/attachments/raport-kompetencje-cyfrowe.pdf',
            description: 'Raport z badań nad poziomem kompetencji cyfrowych polskich uczniów w porównaniu z uczniami z innych krajów UE'
          }
        ],
        order: 1
      }
    ]
  }
];