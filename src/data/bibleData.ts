import { BibleBook, BibleChapterData } from '../types/bible';

export const BIBLE_BOOKS: BibleBook[] = [
  // Perjanjian Lama
  { id: 'kejadian', name: 'Kejadian', testament: 'OT', chaptersCount: 50 },
  { id: 'keluaran', name: 'Keluaran', testament: 'OT', chaptersCount: 40 },
  { id: 'mazmur', name: 'Mazmur', testament: 'OT', chaptersCount: 150 },
  { id: 'amsal', name: 'Amsal', testament: 'OT', chaptersCount: 31 },
  { id: 'yesaya', name: 'Yesaya', testament: 'OT', chaptersCount: 66 },
  { id: 'yeremia', name: 'Yeremia', testament: 'OT', chaptersCount: 52 },

  // Perjanjian Baru
  { id: 'matius', name: 'Matius', testament: 'NT', chaptersCount: 28 },
  { id: 'markus', name: 'Markus', testament: 'NT', chaptersCount: 16 },
  { id: 'lukas', name: 'Lukas', testament: 'NT', chaptersCount: 24 },
  { id: 'yohanes', name: 'Yohanes', testament: 'NT', chaptersCount: 21 },
  { id: 'kisah', name: 'Kisah Para Rasul', testament: 'NT', chaptersCount: 28 },
  { id: 'roma', name: 'Roma', testament: 'NT', chaptersCount: 16 },
  { id: '1korintus', name: '1 Korintus', testament: 'NT', chaptersCount: 16 },
  { id: '2korintus', name: '2 Korintus', testament: 'NT', chaptersCount: 13 },
  { id: 'galatia', name: 'Galatia', testament: 'NT', chaptersCount: 6 },
  { id: 'efesus', name: 'Efesus', testament: 'NT', chaptersCount: 6 },
  { id: 'filipi', name: 'Filipi', testament: 'NT', chaptersCount: 4 },
  { id: 'kolose', name: 'Kolose', testament: 'NT', chaptersCount: 4 },
  { id: 'ibrani', name: 'Ibrani', testament: 'NT', chaptersCount: 13 },
  { id: 'yakobus', name: 'Yakobus', testament: 'NT', chaptersCount: 5 },
  { id: '1petrus', name: '1 Petrus', testament: 'NT', chaptersCount: 5 },
  { id: '1yohanes', name: '1 Yohanes', testament: 'NT', chaptersCount: 5 },
  { id: 'wahyu', name: 'Wahyu', testament: 'NT', chaptersCount: 22 },
];

export const CURATED_BIBLE_CHAPTERS: Record<string, BibleChapterData> = {
  'ibrani-11': {
    bookId: 'ibrani',
    bookName: 'Ibrani',
    chapter: 11,
    verses: [
      {
        verse: 1,
        tb: 'Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat.',
        kjv: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
        tolaki: 'Ingo pe’imano no’ia tumbuno iroto pinemembaako tee tanda ponggito no’ia kii mo’ito.',
      },
      {
        verse: 2,
        tb: 'Sebab oleh imanlah telah diberikan kesaksian kepada nenek moyang kita.',
        kjv: 'For by it the elders obtained a good report.',
        tolaki: 'Kano sababu pe’imano mbonia nggomiu tuha-tuha nda’i iroto te’itao pongaku motuo.',
      },
      {
        verse: 3,
        tb: 'Karena iman kita mengerti, bahwa alam semesta telah dijadikan oleh firman Allah, sehingga apa yang kita lihat telah terjadi dari apa yang tidak dapat kita lihat.',
        kjv: 'Through faith we understand that the worlds were framed by the word of God, so that things which are seen were not made of things which do appear.',
        tolaki: 'Sababu pe’imano to’itoho ato wonua te lino pina’ina no bisarano Ombu Dewata, sanggana olono to’ito kii pina’ina no olono kii mo’ito.',
      },
      {
        verse: 4,
        tb: 'Karena iman Habel telah mempersembahkan kepada Allah korban yang lebih baik dari pada korban Kain. Dengan jalan itu ia memperoleh kesaksian, bahwa ia benar, karena Allah berkenan akan persembahannya itu dan karena iman ia masih berbicara, sesudah ia mati.',
        kjv: 'By faith Abel offered unto God a more excellent sacrifice than Cain, by which he obtained witness that he was righteous, God testifying of his gifts: and by it he being dead yet speaketh.',
        tolaki: 'Sababu pe’imano i Habel no’totuduiko i Ombu Dewata sosoromba mokonggo nggo sosorombano i Kain. Ipotouto ia no’olo pongaku kano ia to’ono motuo, kano Ombu Dewata no’inonga tee sosorombano; tee sababu pe’imano ia me’bisara mbule la’uno mate.',
      },
      {
        verse: 5,
        tb: 'Karena iman Henokh terangkat, supaya ia tidak mengalami kematian, dan ia tidak ditemukan, karena Allah telah mengangkatnya. Sebab sebelum ia terangkat, ia memperoleh kesaksian, bahwa ia berkenan kepada Allah.',
        kjv: 'By faith Enoch was translated that he should not see death; and was not found, because God had translated him: for before his translation he had this testimony, that he pleased God.',
        tolaki: 'Sababu pe’imano i Henokh no’te’ala langi kii no’gito mate; tee kii no’teronggo kano Ombu Dewata no’alaio. Kano la’uno no’te’ala ia no’olo pongaku kano ia no’pakadamo inahuno Ombu Dewata.',
      },
      {
        verse: 6,
        tb: 'Tetapi tanpa iman tidak mungkin orang berkenan kepada Allah. Sebab barangsiapa berpaling kepada Allah, ia harus percaya bahwa Allah ada, dan bahwa Allah memberi upah kepada orang yang sungguh-sungguh mencari Dia.',
        kjv: 'But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.',
        tolaki: 'Tee kii mo’ia pe’imano kii momoko to’ono no’pakadamo inahuno Ombu Dewata. Kano inae me’oli i Ombu Dewata noparaluu me’imano kano Ombu Dewata no’ia, tee Ia nowawa upa i to’ono motekono no’pesoloio.',
      },
      {
        verse: 7,
        tb: 'Karena iman, maka Nuh—dengan petunjuk Allah tentang sesuatu yang belum kelihatan—dengan taat mempersiapkan bahtera untuk menyelamatkan keluarganya; dan karena iman itu ia menghukum dunia, dan ditentukan untuk menerima kebenaran, sesuai dengan imannya.',
        kjv: 'By faith Noah, being warned of God of things not seen as yet, moved with fear, prepared an ark to the saving of his house; by the which he condemned the world, and became heir of the righteousness which is by faith.',
        tolaki: 'Sababu pe’imano i Nuh—no’tolao petuduno Ombu Dewata kano olono kii mo’ito—tee pe’ambuno no’pina’ina banua wose no’patuai kakarano; tee sababu pe’imano ia no’potingkihi wonua tee no’dadi to’ono motuo sababu pe’imano.',
      },
      {
        verse: 8,
        tb: 'Karena iman Abraham taat, ketika ia dipanggil untuk berangkat ke negeri yang akan diterimanya menjadi milik pusakanya, lalu ia berangkat dengan tidak mengetahui ke mana ia pergi.',
        kjv: 'By faith Abraham, when he was called to go out into a place which he should after receive for an inheritance, obeyed; and he went out, not knowing whither he went.',
        tolaki: 'Sababu pe’imano i Abraham no’tundu la’uno no’kiyoo me’lao i wonua pinepohailo ano ana warisino; ia no’lao kii no’toho nggo i’nae no’laoio.',
      },
    ],
  },

  'yohanes-3': {
    bookId: 'yohanes',
    bookName: 'Yohanes',
    chapter: 3,
    verses: [
      {
        verse: 14,
        tb: 'Dan sama seperti Musa meninggikan ular di padang gurun, demikian juga Anak Manusia harus ditinggikan,',
        kjv: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:',
        tolaki: 'Tee kano i Musa no’pakeakea olou i padang gurun, kagito mbule Anano To’ono noparaluu i’pakeakea,',
      },
      {
        verse: 15,
        tb: 'supaya setiap orang yang percaya kepada-Nya beroleh hidup yang kekal.',
        kjv: 'That whosoever believeth in him should not perish, but have eternal life.',
        tolaki: 'sanggana i’nae-nae me’imano i Ia no’olo tuwo mo’ia tano kii no’mate.',
      },
      {
        verse: 16,
        tb: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
        kjv: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        tolaki: 'Kano kagito wose pompakano Ombu Dewata i wonua ie, sanggana no’tuduiko Anano mo’asonggo, sanggana inae-nae me’imano i Ia kii no’mate, kano no’olo tuwo kekal tano mate.',
      },
      {
        verse: 17,
        tb: 'Sebab Allah mengutus Anak-Nya ke dalam dunia bukan untuk menghakimi dunia, melainkan untuk menyelamatkannya oleh Dia.',
        kjv: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
        tolaki: 'Kano Ombu Dewata kii no’pepalao Anano i wonua no’hukumu wonua, kano sanggana wonua no’tepakarua i lalano Ia.',
      },
      {
        verse: 18,
        tb: 'Barangsiapa percaya kepada-Nya, ia tidak akan dihukum; barangsiapa tidak percaya, ia telah berada di bawah hukuman, sebab ia tidak percaya dalam nama Anak tunggal Allah.',
        kjv: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
        tolaki: 'Inae me’imano i Ia kii no’tehukumu; inae kii me’imano no’tehukumumo, kano kii me’imano i asangano Anano mo’asonggo Ombu Dewata.',
      },
    ],
  },

  'yohanes-1': {
    bookId: 'yohanes',
    bookName: 'Yohanes',
    chapter: 1,
    verses: [
      {
        verse: 1,
        tb: 'Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah.',
        kjv: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
        tolaki: 'I pu’uno no’iamo Bisara; Bisara ie no’posamoo tee Ombu Dewata, tee Bisara ie no’ia Ombu Dewata.',
      },
      {
        verse: 2,
        tb: 'Ia pada mulanya bersama-sama dengan Allah.',
        kjv: 'The same was in the beginning with God.',
        tolaki: 'Ia i pu’uno no’posamoo tee Ombu Dewata.',
      },
      {
        verse: 3,
        tb: 'Segala sesuatu dijadikan oleh Dia dan tanpa Dia tidak ada suatupun yang telah jadi dari segala yang telah dijadikan.',
        kjv: 'All things were made by him; and without him was not any thing made that was made.',
        tolaki: 'Tee iroto olono pina’ina no Ia, tee kii no’ia Ia kii mo’ia asa olono pina’ina.',
      },
      {
        verse: 4,
        tb: 'Dalam Dia ada hidup dan hidup itu adalah terang manusia.',
        kjv: 'In him was life; and the life was the light of men.',
        tolaki: 'I lalano Ia no’ia tuwo, tee tuwo ie no’ia pewulano to’ono manusia.',
      },
      {
        verse: 5,
        tb: 'Terang itu bercahaya di dalam kegelapan dan kegelapan itu tidak menguasainya.',
        kjv: 'And the light shineth in darkness; and the darkness comprehended it not.',
        tolaki: 'Pewula ie no’mepewula i lalano mbero, tee mbero kii momoko no’tindo’io.',
      },
      {
        verse: 14,
        tb: 'Firman itu telah menjadi manusia, dan diam di antara kita, dan kita telah melihat kemuliaan-Nya, yaitu kemuliaan yang diberikan kepada-Nya sebagai Anak Tunggal Bapa, penuh kasih karunia dan kebenaran.',
        kjv: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
        tolaki: 'Bisara ie no’dadi manusia, tee no’tuwo i tonga-tongada to’ito; to’ito no’gito kamuliangano, kamuliangano Anano mo’asonggo Bapa, napu tee pompakano tee petoho.',
      },
    ],
  },

  'yohanes-15': {
    bookId: 'yohanes',
    bookName: 'Yohanes',
    chapter: 15,
    verses: [
      {
        verse: 1,
        tb: 'Akulah pokok anggur yang benar dan Bapa-Kulah pengusahanya.',
        kjv: 'I am the true vine, and my Father is the husbandman.',
        tolaki: 'Inakumo pu’uno anggur motuo, tee Amakumo to’ono momparekaindo.',
      },
      {
        verse: 4,
        tb: 'Tinggallah di dalam Aku dan Aku di dalam kamu. Sama seperti ranting tidak dapat berbuah dari dirinya sendiri, kalau ia tidak tinggal pada pokok anggur, demikian juga kamu tidak berbuah, jikalau kamu tidak tinggal di dalam Aku.',
        kjv: 'Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.',
        tolaki: 'Mo’iamo i lalaku tee Inaku i lalagimiu. Kano tangano anggur kii momoko me’wua no wungano la’uno kii mo’ia i pu’uno, kagito mbule inggomiu kii me’wua la’uno kii mo’ia i lalaku.',
      },
      {
        verse: 5,
        tb: 'Akulah pokok anggur dan kamulah ranting-rantingnya. Barangsiapa tinggal di dalam Aku dan Aku di dalam dia, ia berbuah banyak, sebab di luar Aku kamu tidak dapat berbuat apa-apa.',
        kjv: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.',
        tolaki: 'Inakumo pu’uno anggur tee inggomiu tanga-tangano. Inae mo’ia i lalaku tee Inaku i lalano, ia me’wua me’tano; kano la’uno i hawuku inggomiu kii momoko mo’pina’ina asa olono.',
      },
    ],
  },

  'mazmur-23': {
    bookId: 'mazmur',
    bookName: 'Mazmur',
    chapter: 23,
    verses: [
      {
        verse: 1,
        tb: 'TUHAN adalah gembalaku, takkan kekurangan aku.',
        kjv: 'The LORD is my shepherd; I shall not want.',
        tolaki: 'Ombu Dewatamo to’ono mompatoroku, kii mo’ia kakurangangku.',
      },
      {
        verse: 2,
        tb: 'Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang;',
        kjv: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
        tolaki: 'Ia no’patindoaku i rano mbeu moruru, Ia no’pandoaku i wohe marondano;',
      },
      {
        verse: 3,
        tb: 'Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya.',
        kjv: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
        tolaki: 'Ia no’paporiho inahungku. Ia no’pandoaku i ohalo motuo sababu asangano.',
      },
      {
        verse: 4,
        tb: 'Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku.',
        kjv: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
        tolaki: 'Tano inaku me’lao i pombelo mbero mate, inaku kii me’ambu olono me’koni, kano Iko no’posamooku; suangamu tee tekamu no’pakadamo inahungku.',
      },
      {
        verse: 5,
        tb: 'Engkau menyediakan hidangan bagiku, di hadapan lawanku; Engkau mengurapi kepalaku dengan minyak; pialaku penuh melimpah.',
        kjv: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
        tolaki: 'Iko no’sadiako kinandeku i arowano bali-balingku; Iko no’sulo wuluku tee lana; mangkuku napu tee melolo.',
      },
      {
        verse: 6,
        tb: 'Kebajikan dan kemurahan belaka akan mengikuti aku, seumur hidupku; dan aku akan diam dalam rumah TUHAN sepanjang masa.',
        kjv: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
        tolaki: 'Katohoano motuo tee pompakano no’tu’uriku selalano tuwoku; tee inaku me’tuwo i banuano Ombu Dewata tano tano ambo.',
      },
    ],
  },

  'roma-8': {
    bookId: 'roma',
    bookName: 'Roma',
    chapter: 8,
    verses: [
      {
        verse: 1,
        tb: 'Demikianlah sekarang tidak ada penghukuman bagi mereka yang ada di dalam Kristus Yesus.',
        kjv: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.',
        tolaki: 'Kagito ambo kii mo’ia hukumu i to’ono i lalano Kristus Yesus.',
      },
      {
        verse: 28,
        tb: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.',
        kjv: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
        tolaki: 'To’ito to’ho ambo kano Ombu Dewata no’pomoronga i lalano iroto olono no’wawa kakadano i to’ono mengkasihi Ia, no’ia iroto pinekiyono tundu tee ranganano.',
      },
      {
        verse: 31,
        tb: 'Sebab itu apakah yang akan kita katakan tentang semuanya itu? Jika Allah di pihak kita, siapakah yang akan melawan kita?',
        kjv: 'What shall we then say to these things? If God be for us, who can be against us?',
        tolaki: 'Tee olono to’bisaako i lalano iroto? La’uno Ombu Dewata no’samba to’ito, inae momoko me’bali to’ito?',
      },
      {
        verse: 38,
        tb: 'Sebab aku yakin, bahwa baik maut, maupun hidup, baik malaikat-malaikat, maupun pemerintah-pemerintah, baik yang ada sekarang, maupun yang akan datang,',
        kjv: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,',
        tolaki: 'Kano inaku me’yakin, kano mate ato tuwo, malaikat ato mokawasa, olono ambo ato olono me’koliha,',
      },
      {
        verse: 39,
        tb: 'maupun kuasa-kuasa, baik yang di atas, maupun yang di bawah, ataupun sesuatu makhluk lain, tidak akan dapat memisahkan kita dari kasih Allah, yang ada dalam Kristus Yesus, Tuhan kita.',
        kjv: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
        tolaki: 'ato kawasa i langi ato i rowa, ato asa olono pina’ina, kii momoko no’pasae to’ito nggo pompakano Ombu Dewata i lalano Kristus Yesus, Ombuto.',
      },
    ],
  },
};
