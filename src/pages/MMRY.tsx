import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const MMRY: React.FC = () => {
  useEffect(() => {
    const title = "मुख्यमंत्री महिला रोजगार योजना | आवेदन/फॉर्म भरने की जानकारी";
    const description =
      "इस पेज पर मुख्यमंत्री महिला रोजगार योजना के आवेदन/फॉर्म भरने से संबंधित आधिकारिक जानकारी, पात्रता, सहायता राशि और प्रक्रिया दी गई है। यह केवल जानकारी हेतु है—आधिकारिक आवेदन लिंक यहाँ उपलब्ध है।";
    const canonicalUrl = "https://dastavezai.org/mukhya-mantri-mahila-rojgar-yojana-fill-form";

    document.title = title;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const setProperty = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Basic SEO
    setMeta("description", description);
    setMeta("robots", "index,follow");

    // Canonical
    let linkCanonical = document.querySelector("link[rel=canonical]") as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // Open Graph
    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:type", "website");
    setProperty("og:url", canonicalUrl);
    setProperty("og:image", "https://dastavezai.org/placeholder.svg");

    // Twitter
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", "https://dastavezai.org/placeholder.svg");

    // JSON-LD Structured Data
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dastavezai.org/' },
        { '@type': 'ListItem', position: 2, name: 'मुख्यमंत्री महिला रोजगार योजना (फॉर्म जानकारी)', item: canonicalUrl }
      ]
    };
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'मुख्यमंत्री महिला रोजगार योजना — आवेदन/फॉर्म जानकारी',
      description,
      mainEntityOfPage: canonicalUrl,
      image: ['https://dastavezai.org/placeholder.svg'],
      author: { '@type': 'Organization', name: 'Dastavez AI' },
      publisher: { '@type': 'Organization', name: 'Dastavez AI' },
      datePublished: new Date().toISOString()
    };
    const addJsonLd = (json: object, id: string) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(json);
    };
    addJsonLd(breadcrumbLd, 'ld-breadcrumb-mmry');
    addJsonLd(articleLd, 'ld-article-mmry');

    // FAQ Schema
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'क्या यह आधिकारिक आवेदन पेज है?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'नहीं। यह पेज केवल जानकारी हेतु है। आधिकारिक आवेदन लिंक mmry.brlps.in पर उपलब्ध है।'
          }
        },
        {
          '@type': 'Question',
          name: 'आवेदन कहाँ करें?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'आप आधिकारिक वेबसाइट mmry.brlps.in पर ऑनलाइन आवेदन कर सकते हैं।'
          }
        },
        {
          '@type': 'Question',
          name: 'प्रथम किस्त में कितनी राशि मिलती है?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'योजना के तहत ₹10,000 की राशि प्रथम किस्त के रूप में दी जाती है।'
          }
        },
        {
          '@type': 'Question',
          name: 'अतिरिक्त वित्तीय सहायता कितनी मिल सकती है?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'आवश्यकतानुसार आकलन के बाद ₹2 लाख तक की अतिरिक्त सहायता मिल सकती है।'
          }
        }
      ]
    };
    addJsonLd(faqLd, 'ld-faq-mmry');
  }, []);

  return (
    <div className="min-h-screen bg-judicial-dark text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto bg-judicial-navy/40 border border-judicial-gold/20 rounded-2xl p-6 md:p-10 backdrop-blur">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            मुख्यमंत्री महिला रोजगार योजना
          </h1>
          <p className="text-center text-sm md:text-base text-gray-300 mb-8">
            जानकारी स्रोत: बिहार ग्रामीण जीविकोपार्जन प्रोत्साहन समिति (जीविका) —
            <a className="text-judicial-gold hover:underline ml-1" href="https://mmry.brlps.in/" target="_blank" rel="noopener noreferrer">https://mmry.brlps.in/</a>
          </p>

          <section className="space-y-6 leading-relaxed">
            <p className="text-center text-judicial-gold font-semibold">
              सशक्त उद्यम... सशक्त महिलाएँ... सशक्त बिहार...
            </p>

            <h2 className="text-2xl font-semibold text-judicial-gold">योजना के बारे में</h2>
            <p>
              बिहार सरकार द्वारा महिला सशक्तिकरण की दिशा में महिलाओं के रोजगार को बढ़ावा देने हेतु ‘मुख्यमंत्री महिला रोजगार योजना’ का शुभारंभ किया गया है।
            </p>
            <p>
              इस योजना का मुख्य लक्ष्य राज्य के प्रत्येक परिवार की एक महिला की अपनी पसंद का रोजगार शुरू करने के लिए आर्थिक सहायता प्रदान करना है।
            </p>
            <p>
              इस योजना का क्रियान्वयन ग्रामीण विकास विभाग, बिहार सरकार द्वारा बिहार ग्रामीण जीविकोपार्जन प्रोत्साहन समिति (जीविका) के माध्यम से प्रक्रिया प्रारंभ कर दी गयी है। राज्य के शहरी क्षेत्रों में योजना के क्रियान्वयन हेतु नगर विकास एवं आवास विभाग, बिहार सरकार का सहयोग लिया जाएगा।
            </p>

            <h2 className="text-2xl font-semibold text-judicial-gold">योजना अंतर्गत मुख्य लक्ष्य</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                योजना के तहत आर्थिक सहायता के रूप में प्रत्येक परिवार की एक महिला की अपनी पसंद का रोजगार करने हेतु ₹ 10 हजार रुपए की राशि प्रथम किस्त के रूप में दी जाएगी।
              </li>
              <li>
                महिलाओं द्वारा रोजगार आरंभ करने के उपरांत आकलन कर ₹ 2 लाख रुपए तक की अतिरिक्त वित्तीय सहायता आवश्यकतानुसार दी जाएगी।
              </li>
              <li>
                बिहार सरकार की इस पहल से न केवल महिलाओं का सशक्तिकरण होगा, बल्कि राज्य की अर्थव्यवस्था को भी बढ़ावा मिलेगा।
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-judicial-gold">योजना संबंधित अहर्ता/ पात्रता</h2>
            <p>
              योजना अंतर्गत ‘परिवार से आशय’ है, पति-पत्नी और उनके अविवाहित बच्चे। अविवाहित वयस्क महिला जिनके माता-पिता जीवित नहीं हो, उन्हें योजना के प्रयोजनार्थ एकल परिवार माना जायेगा एवं नियमानुसार लाभ प्रदान किया जाएगा।
            </p>
            <p>
              शहरी क्षेत्रों के स्वयं सहायता समूहों से जुड़े सभी सदस्य (एक परिवार से एक महिला), इस योजना के लाभ हेतु पात्र होंगें।
            </p>
            <p>
              महिलाएँ जो वर्तमान में शहरी क्षेत्र में स्वयं सहायता समूह की सदस्य नहीं है, को सदस्य के रूप में जोड़ने से पूर्व योजना अन्तर्गत परिवार की परिभाषा को ध्यान में रखते हुए आवेदन प्राप्ति के उपरांत उन्हें समूह में जोड़ने हेतु उनके क्षेत्र में कार्यरत सामुदायिक संसाधन सेवी द्वारा सम्पर्क किया जाएगा। समूह में जुड़ने के बाद ही योजना का लाभ प्रदान किया जाएगा।
            </p>
            <p className="font-semibold">
              शहरी क्षेत्र की महिलाएं जो पूर्व से ही स्वयं सहायता समूह से जुड़ी है उन्हें ऑनलाइन आवेदन करने की आवश्यकता नहीं है।
            </p>
            <p>
              शहरी क्षेत्र की जो महिलाएं स्वयं सहायता समूह से नहीं जुड़ी है, उनके द्वारा आवेदन करने हेतु जीविका के वेबसाइट पर लिंक उपलब्ध है।
            </p>
            <p>
              सभी प्राप्त आवेदनों का भौतिक सत्यापन किया जाएगा एवं यह भी सुनिश्चित किया जाएगा कि महिला बिहार राज्य की निवासी हो। योजना का लाभ लेने के क्रम में प्रशिक्षण लेना आवश्यक होगा। आगे आवश्यकतानुसार अन्य दस्तावेजों की मांग की जा सकती है।
            </p>

            <h2 className="text-2xl font-semibold text-judicial-gold">ग्रामीण क्षेत्रों के महिलाओं हेतु आवेदन की प्रक्रिया</h2>
            <p>
              जीविका स्वयं सहायता समूह से जुड़े सभी सदस्य इस योजना के पात्र होंगें। वे इस योजना का लाभ लेने के लिए अपने ग्राम संगठन में जाकर आवेदन करेंगी। समूह के सभी सदस्यों की एक विशेष बैठक ग्राम संगठन स्तर पर आयोजित की जाएगी जिसमें एक समूह के सभी सदस्यों का एक समेकित प्रपत्र में आवेदन लिया जाएगा।
            </p>
            <p>
              जो महिलाएं जीविका स्वयं सहायता समूह से नहीं जुड़ी है उन्हें योजना का लाभ प्राप्त करने हेतु सर्वप्रथम स्वयं सहायता समूह में जुड़ने के लिए अपना आवेदन संबंधित ग्राम संगठन में निर्धारित प्रपत्र में जमा करेंगे।
            </p>

            <div className="p-4 rounded-lg bg-judicial-navy/60 border border-judicial-gold/20">
              <p className="font-medium">
                आवेदन या इस योजना का लाभ दिलाने हेतु अगर किसी तरह की राशि की मांग की जाती है तो संबंधित नगर निकाय कार्यालय एवं जीविका के जिला कार्यालय में इसकी शिकायत कर सकते हैं।
              </p>
            </div>

            <p className="text-sm text-gray-400">
              बिहार सरकार ने महिलाओं को सशक्त बनाने के लिए एक नई पहल ‘मुख्यमंत्री महिला रोज़गार योजना’ को मंजूरी दी है। इस योजना का मुख्य लक्ष्य राज्य के हर परिवार से एक महिला को रोज़गार के अवसर प्रदान करना है, जिससे वह अपनी पसंद का उद्यम शुरू कर सके। 29 अगस्त 2025 को अनुमोदित बिहार सरकार की यह पहल, महिलाओं को आत्मनिर्भर एवं आर्थिक सशक्तिकरण की दिशा में एक महत्वपूर्ण कदम है।
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <a
                href="https://mmry.brlps.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 rounded-lg bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-lightGold transition-colors text-center w-full sm:w-auto"
                aria-label="मुख्यमंत्री महिला रोजगार योजना आधिकारिक वेबसाइट पर आवेदन भरें"
              >
                आवेदन भरें (Official)
              </a>
              <a
                href="https://mmry.brlps.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 rounded-lg bg-transparent border border-judicial-gold text-judicial-gold font-semibold hover:bg-judicial-gold/10 transition-colors text-center w-full sm:w-auto"
              >
                और जानें
              </a>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-judicial-gold mb-3">अक्सर पूछे जाने वाले प्रश्न (FAQ)</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">क्या यह आधिकारिक आवेदन पेज है?</p>
                  <p className="text-gray-300">नहीं। यह पेज केवल जानकारी हेतु है। आधिकारिक आवेदन लिंक mmry.brlps.in पर उपलब्ध है।</p>
                </div>
                <div>
                  <p className="font-medium">आवेदन कहाँ करें?</p>
                  <p className="text-gray-300">आधिकारिक वेबसाइट <a className="text-judicial-gold hover:underline" href="https://mmry.brlps.in/" target="_blank" rel="noopener noreferrer">mmry.brlps.in</a> पर ऑनलाइन आवेदन करें।</p>
                </div>
                <div>
                  <p className="font-medium">प्रथम किस्त में कितनी राशि मिलती है?</p>
                  <p className="text-gray-300">₹10,000 प्रथम किस्त के रूप में।</p>
                </div>
                <div>
                  <p className="font-medium">अतिरिक्त वित्तीय सहायता कितनी मिल सकती है?</p>
                  <p className="text-gray-300">आवश्यकतानुसार ₹2 लाख तक की अतिरिक्त सहायता।</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MMRY;


