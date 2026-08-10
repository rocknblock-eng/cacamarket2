export const CATEGORIES = [
  { id: 'optica', label: 'Ótica' },
  { id: 'vestuario', label: 'Vestuário' },
  { id: 'acessorios', label: 'Acessórios' },
  { id: 'caes', label: 'Cães de Caça' },
  { id: 'chamarizes', label: 'Diversos / Outros' },
  { id: 'facas', label: 'Facas' },
  { id: 'eletronica', label: 'Eletrónica' },
  { id: 'servicos', label: 'Serviços' }
]

export const SELLERS = {
  s1: {
    id: 's1',
    name: 'João Ferreira',
    type: 'Particular',
    verified: true,
    rating: 4.8,
    reviews: 32,
    location: 'Évora',
    memberSince: '2022',
    phone: '+351912345678',
    email: 'joao.ferreira.exemplo@email.com'
  },
  s2: {
    id: 's2',
    name: 'Espingardaria do Norte',
    type: 'Loja Profissional',
    verified: true,
    rating: 4.9,
    reviews: 210,
    location: 'Braga',
    memberSince: '2019',
    phone: '+351913456789',
    email: 'geral.exemplo@espingardariadonorte.pt'
  },
  s3: {
    id: 's3',
    name: 'Ana Rodrigues',
    type: 'Particular',
    verified: false,
    rating: 4.5,
    reviews: 8,
    location: 'Santarém',
    memberSince: '2024',
    phone: null,
    email: 'ana.rodrigues.exemplo@email.com'
  }
}

export const LISTINGS = [
  {
    id: 'l1',
    title: 'Luneta de caça 3-9x40 com retículo iluminado',
    category: 'optica',
    price: 189,
    sellerId: 's2',
    condition: 'Novo',
    image: null,
    description: 'Luneta de caça com ampliação 3-9x e objetiva de 40mm. Retículo iluminado com vários níveis de intensidade, ideal para caça ao amanhecer e ao entardecer. Lentes com tratamento multicamada para maior nitidez.'
  },
  {
    id: 'l2',
    title: 'Casaco impermeável de caça, camuflado floresta',
    category: 'vestuario',
    price: 79,
    sellerId: 's1',
    condition: 'Usado - Bom estado',
    image: null,
    description: 'Casaco impermeável e respirável, padrão camuflado floresta. Vários bolsos funcionais, capuz ajustável e costuras seladas. Usado poucas vezes, sem sinais de desgaste relevantes.'
  },
  {
    id: 'l3',
    title: 'Cinto porta-cartuchos em pele, 25 posições',
    category: 'acessorios',
    price: 34,
    sellerId: 's3',
    condition: 'Novo',
    image: null,
    description: 'Cinto em pele genuína com 25 posições para cartuchos, fivela reforçada e ajuste regulável. Acabamento artesanal, ideal para jornadas de caça mais longas.'
  },
  {
    id: 'l4',
    title: 'Podenco Português Médio, treinado para caça ao coelho',
    category: 'caes',
    price: 350,
    sellerId: 's1',
    condition: '—',
    image: null,
    description: 'Podenco Português de porte médio, com treino específico para caça ao coelho. Vacinas em dia e microchip. Bom temperamento, habituado a convívio com outros cães.'
  },
  {
    id: 'l5',
    title: 'Chamariz eletrónico multi-espécie, 200 sons',
    category: 'chamarizes',
    price: 145,
    sellerId: 's2',
    condition: 'Novo',
    image: null,
    description: 'Chamariz eletrónico com biblioteca de mais de 200 sons de várias espécies. Comando remoto com alcance até 150m, coluna resistente à água. Bateria recarregável incluída.'
  },
  {
    id: 'l6',
    title: 'Faca de caça artesanal, lâmina 12cm, cabo em nogueira',
    category: 'facas',
    price: 65,
    sellerId: 's3',
    condition: 'Novo',
    image: null,
    description: 'Faca artesanal com lâmina de aço carbono de 12cm e cabo em madeira de nogueira. Vem com bainha em pele. Peça única, feita por artesão local.'
  },
  {
    id: 'l7',
    title: 'Câmara de observação noturna para vigilância de caça',
    category: 'eletronica',
    price: 220,
    sellerId: 's2',
    condition: 'Novo',
    image: null,
    description: 'Câmara de vigilância com visão noturna infravermelha, deteção de movimento e cartão de memória incluído. Resistente a intempéries, ideal para monitorizar zonas de caça.'
  },
  {
    id: 'l8',
    title: 'Guia de caça acompanhada — Zona de Caça Turística, Alentejo',
    category: 'servicos',
    price: 120,
    sellerId: 's2',
    condition: '—',
    image: null,
    description: 'Serviço de acompanhamento com guia licenciado numa Zona de Caça Turística no Alentejo. Inclui transporte no local e apoio na identificação de espécies autorizadas.'
  }
]
