export const CATEGORIES = [{
  id: 'optica',
  label: '\u00d3tica'
}, {
  id: 'vestuario',
  label: 'Vestu\u00e1rio'
}, {
  id: 'acessorios',
  label: 'Acess\u00f3rios'
}, {
  id: 'caes',
  label: 'C\u00e3es de Ca\u00e7a'
}, {
  id: 'chamarizes',
  label: 'Diversos / Outros'
}, {
  id: 'facas',
  label: 'Facas'
}, {
  id: 'eletronica',
  label: 'Eletr\u00f3nica'
}, {
  id: 'servicos',
  label: 'Servi\u00e7os'
}];
export const SELLERS = {
  s1: {
    id: 's1',
    name: 'Jo\u00e3o Ferreira',
    type: 'Particular',
    verified: true,
    rating: 4.8,
    reviews: 32,
    location: '\u00c9vora',
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
    location: 'Santar\u00e9m',
    memberSince: '2024',
    phone: null,
    email: 'ana.rodrigues.exemplo@email.com'
  }
};
export const LISTINGS = [{
  id: 'l1',
  title: 'Luneta de ca\u00e7a 3-9x40 com ret\u00edculo iluminado',
  category: 'optica',
  price: 189,
  sellerId: 's2',
  condition: 'Novo',
  image: null,
  description: 'Luneta de ca\u00e7a com amplia\u00e7\u00e3o 3-9x e objetiva de 40mm. Ret\u00edculo iluminado com v\u00e1rios n\u00edveis de intensidade, ideal para ca\u00e7a ao amanhecer e ao entardecer. Lentes com tratamento multicamada para maior nitidez.'
}, {
  id: 'l2',
  title: 'Casaco imperme\u00e1vel de ca\u00e7a, camuflado floresta',
  category: 'vestuario',
  price: 79,
  sellerId: 's1',
  condition: 'Usado - Bom estado',
  image: null,
  description: 'Casaco imperme\u00e1vel e respir\u00e1vel, padr\u00e3o camuflado floresta. V\u00e1rios bolsos funcionais, capuz ajust\u00e1vel e costuras seladas. Usado poucas vezes, sem sinais de desgaste relevantes.'
}, {
  id: 'l3',
  title: 'Cinto porta-cartuchos em pele, 25 posi\u00e7\u00f5es',
  category: 'acessorios',
  price: 34,
  sellerId: 's3',
  condition: 'Novo',
  image: null,
  description: 'Cinto em pele genu\u00edna com 25 posi\u00e7\u00f5es para cartuchos, fivela refor\u00e7ada e ajuste regul\u00e1vel. Acabamento artesanal, ideal para jornadas de ca\u00e7a mais longas.'
}, {
  id: 'l4',
  title: 'Podenco Portugu\u00eas M\u00e9dio, treinado para ca\u00e7a ao coelho',
  category: 'caes',
  price: 350,
  sellerId: 's1',
  condition: '\u2014',
  image: null,
  description: 'Podenco Portugu\u00eas de porte m\u00e9dio, com treino espec\u00edfico para ca\u00e7a ao coelho. Vacinas em dia e microchip. Bom temperamento, habituado a conv\u00edvio com outros c\u00e3es.'
}, {
  id: 'l6',
  title: 'Faca de ca\u00e7a artesanal, l\u00e2mina 12cm, cabo em nogueira',
  category: 'facas',
  price: 65,
  sellerId: 's3',
  condition: 'Novo',
  image: null,
  description: 'Faca artesanal com l\u00e2mina de a\u00e7o carbono de 12cm e cabo em madeira de nogueira. Vem com bainha em pele. Pe\u00e7a \u00fanica, feita por artes\u00e3o local.'
}, {
  id: 'l7',
  title: 'C\u00e2mara de observa\u00e7\u00e3o noturna para vigil\u00e2ncia de ca\u00e7a',
  category: 'eletronica',
  price: 220,
  sellerId: 's2',
  condition: 'Novo',
  image: null,
  description: 'C\u00e2mara de vigil\u00e2ncia com vis\u00e3o noturna infravermelha, dete\u00e7\u00e3o de movimento e cart\u00e3o de mem\u00f3ria inclu\u00eddo. Resistente a intemp\u00e9ries, ideal para monitorizar zonas de ca\u00e7a.'
}, {
  id: 'l8',
  title: 'Guia de ca\u00e7a acompanhada \u2014 Zona de Ca\u00e7a Tur\u00edstica, Alentejo',
  category: 'servicos',
  price: 120,
  sellerId: 's2',
  condition: '\u2014',
  image: null,
  description: 'Servi\u00e7o de acompanhamento com guia licenciado numa Zona de Ca\u00e7a Tur\u00edstica no Alentejo. Inclui transporte no local e apoio na identifica\u00e7\u00e3o de esp\u00e9cies autorizadas.'
}];
