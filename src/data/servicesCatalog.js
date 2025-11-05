import { Spa, Build, DirectionsCar, Star } from '@mui/icons-material';

export const getServicesCatalog = (language) => {
  const t = {
    beauty: language === 'en' ? 'Beauty Services' : language === 'tr' ? 'Güzellik Hizmetleri' : 'Услуги красоты',
    facial: language === 'en' ? 'Facial Treatment' : language === 'tr' ? 'Yüz Bakımı' : 'Уход за лицом',
    manicure: language === 'en' ? 'Manicure' : language === 'tr' ? 'Manikür' : 'Маникюр',
    pedicure: language === 'en' ? 'Pedicure' : language === 'tr' ? 'Pedikür' : 'Педикюр',

    wellness: language === 'en' ? 'Wellness & Spa' : language === 'tr' ? 'Sağlık & Spa' : 'Здоровье и СПА',
    massage: language === 'en' ? 'Massage' : language === 'tr' ? 'Masaj' : 'Массаж',
    bodyTreatment: language === 'en' ? 'Body Treatment' : language === 'tr' ? 'Vücut Bakımı' : 'Уход за телом',
    aromatherapy: language === 'en' ? 'Aromatherapy' : language === 'tr' ? 'Aromaterapi' : 'Ароматерапия',

    automotive: language === 'en' ? 'Automotive Services' : language === 'tr' ? 'Otomotiv Hizmetleri' : 'Автомобильные услуги',
    carWash: language === 'en' ? 'Car Wash' : language === 'tr' ? 'Araba Yıkama' : 'Мойка автомобиля',
    oilChange: language === 'en' ? 'Oil Change' : language === 'tr' ? 'Yağ Değişimi' : 'Замена масла',
    tireService: language === 'en' ? 'Tire Service' : language === 'tr' ? 'Lastik Servisi' : 'Шиномонтаж',

    premium: language === 'en' ? 'Premium Services' : language === 'tr' ? 'Premium Hizmetler' : 'Премиум услуги',
    luxuryPackage: language === 'en' ? 'Luxury Package' : language === 'tr' ? 'Lüks Paket' : 'Люкс пакет',
    vipService: language === 'en' ? 'VIP Service' : language === 'tr' ? 'VIP Hizmet' : 'VIP обслуживание',
    exclusiveTreatment: language === 'en' ? 'Exclusive Treatment' : language === 'tr' ? 'Özel Bakım' : 'Эксклюзивный уход'
  };

  const catalog = [
    {
      id: 'beauty',
      name: t.beauty,
      icon: <Spa />,
      services: [
        { id: 'facial-treatment', name: t.facial, duration: 60, price: 45, flags: { popular: true } },
        { id: 'manicure', name: t.manicure, duration: 45, price: 25, flags: { popular: true } },
        { id: 'pedicure', name: t.pedicure, duration: 60, price: 35, flags: {} }
      ]
    },
    {
      id: 'wellness',
      name: t.wellness,
      icon: <Spa />,
      services: [
        { id: 'massage', name: t.massage, duration: 60, price: 50, flags: { popular: true } },
        { id: 'body-treatment', name: t.bodyTreatment, duration: 90, price: 75, flags: {} },
        { id: 'aromatherapy', name: t.aromatherapy, duration: 45, price: 40, flags: {} }
      ]
    },
    {
      id: 'automotive',
      name: t.automotive,
      icon: <DirectionsCar />,
      services: [
        { id: 'car-wash', name: t.carWash, duration: 30, price: 15, flags: { popular: true } },
        { id: 'oil-change', name: t.oilChange, duration: 45, price: 35, flags: {} },
        { id: 'tire-service', name: t.tireService, duration: 60, price: 25, flags: {} }
      ]
    },
    {
      id: 'premium',
      name: t.premium,
      icon: <Star />,
      services: [
        { id: 'luxury-package', name: t.luxuryPackage, duration: 120, price: 150, flags: { premium: true } },
        { id: 'vip-service', name: t.vipService, duration: 90, price: 100, flags: { premium: true } },
        { id: 'exclusive-treatment', name: t.exclusiveTreatment, duration: 75, price: 85, flags: { premium: true } }
      ]
    }
  ];

  // flatten to services list
  const services = catalog.flatMap(c => c.services.map(s => ({ ...s, categoryId: c.id, categoryName: c.name })));
  return { catalog, services };
};
