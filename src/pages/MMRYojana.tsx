import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const MMRYojana: React.FC = () => {
  useEffect(() => {
    const title = "मुख्यमंत्री रोजगार योजना 2025 | सभी राज्यों की योजनाएं | पात्रता, अनुदान, आवेदन";
    const description =
      "भारत के सभी राज्यों की मुख्यमंत्री रोजगार योजनाएं 2025: पात्रता मानदंड, अनुदान राशि, आवेदन प्रक्रिया की पूरी जानकारी। युवा एवं महिला उद्यमिता को बढ़ावा देने वाली सरकारी योजनाएं।";
    const canonicalUrl = "https://dastavezai.org/mukhya-mantri-rojgar-yojana";

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

    setMeta("description", description);
    setMeta("robots", "index,follow");
    setMeta("keywords", "मुख्यमंत्री रोजगार योजना, सरकारी योजना, रोजगार अनुदान, युवा उद्यमिता, महिला सशक्तिकरण, स्वरोजगार योजना, सरकारी अनुदान, माइक्रो फाइनेंस, क्रेडिट लिंक्ड सब्सिडी, मार्जिन मनी सहायता");
    setMeta("author", "Dastavez AI");
    setMeta("language", "hi");
    setMeta("geo.region", "IN");
    setMeta("geo.placename", "India");

    let linkCanonical = document.querySelector("link[rel=canonical]") as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:type", "article");
    setProperty("og:url", canonicalUrl);

    setMeta("twitter:card", "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // FAQ Schema
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'क्या सभी राज्यों में योजना समान है?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'नहीं। नाम/पात्रता/सहायता राशि राज्यों/केंद्र योजनाओं अनुसार भिन्न हो सकती है।'
          }
        },
        {
          '@type': 'Question',
          name: 'आधिकारिक जानकारी कहाँ मिलेगी?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'संबंधित राज्य/केंद्र की आधिकारिक वेबसाइट और MyScheme पोर्टल पर अद्यतन जानकारी उपलब्ध है।'
          }
        }
      ]
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
    addJsonLd(faqLd, 'ld-faq-mmryojana');

    // Government Services Schema
    const servicesLd = {
      '@context': 'https://schema.org',
      '@type': 'GovernmentService',
      name: 'मुख्यमंत्री रोजगार योजना (सभी राज्य)',
      description: 'भारत के सभी राज्यों की मुख्यमंत्री रोजगार योजनाएं - युवा एवं महिला उद्यमिता को बढ़ावा',
      provider: {
        '@type': 'GovernmentOrganization',
        name: 'भारत सरकार एवं राज्य सरकारें'
      },
      serviceType: 'Employment Scheme',
      areaServed: {
        '@type': 'Country',
        name: 'India'
      },
      url: canonicalUrl
    };
    addJsonLd(servicesLd, 'ld-services-mmryojana');
  }, []);

  return (
    <div className="min-h-screen bg-judicial-dark text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto bg-judicial-navy/40 border border-judicial-gold/20 rounded-2xl p-6 md:p-10 backdrop-blur">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            मुख्यमंत्री रोजगार योजना (Information)
          </h1>
          <p className="text-center text-sm md:text-base text-gray-300 mb-8">
            यह पृष्ठ सूचना हेतु है। आवेदन के लिए अपने राज्य/केंद्र की आधिकारिक वेबसाइट देखें।
          </p>

          <section className="space-y-6 leading-relaxed">
            <h2 className="text-2xl font-semibold text-judicial-gold">उद्देश्य</h2>
            <p>
              युवा एवं महिला उद्यमिता को बढ़ावा देना, स्वरोज़गार के अवसर उपलब्ध कराना और सूक्ष्म एवं लघु उद्यमों को प्रारंभिक पूंजी/अनुदान/सबसिडी प्रदान करना।
            </p>

            <h2 className="text-2xl font-semibold text-judicial-gold">संभावित सहायता</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>प्रारंभिक अनुदान/ब्याज अनुदान/मार्जिन मनी सहायता (राज्य अनुसार भिन्न)।</li>
              <li>परियोजना लागत के अनुपात में सब्सिडी/क्रेडिट-लिंक्ड सुविधा।</li>
              <li>प्रशिक्षण, मेंटरशिप एवं बाज़ार से जोड़ने का सहयोग।</li>
            </ul>

            <h2 className="text-2xl font-semibold text-judicial-gold">पात्रता (सामान्य)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>राज्य/केंद्र सरकार द्वारा अधिसूचित आयु सीमा के भीतर भारतीय नागरिक।</li>
              <li>न्यूनतम शैक्षणिक योग्यता (यदि योजना दिशा-निर्देश में निर्दिष्ट हो)।</li>
              <li>प्राथमिकता: महिलाएँ, दिव्यांगजन, अनुसूचित जाति/जनजाति, अल्पसंख्यक, बेरोज़गार युवा आदि (योजना अनुसार)।</li>
            </ul>

            <h2 className="text-2xl font-semibold text-judicial-gold">आवेदन प्रक्रिया (सामान्य)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>आधिकारिक पोर्टल पर ऑनलाइन पंजीकरण/आवेदन।</li>
              <li>आवश्यक दस्तावेज़ अपलोड: पहचान, निवास, शैक्षणिक/कौशल प्रमाण, परियोजना रिपोर्ट आदि।</li>
              <li>भौतिक सत्यापन/साक्षात्कार/स्क्रीनिंग के उपरांत स्वीकृति।</li>
              <li>स्वीकृति के पश्चात बैंक/विभाग के माध्यम से वित्तीय सहायता का निर्गमन।</li>
            </ol>

            <h2 className="text-2xl font-semibold text-judicial-gold">महत्वपूर्ण नोट</h2>
            <div className="p-4 rounded-lg bg-judicial-navy/60 border border-judicial-gold/20">
              <p className="font-medium">
                विभिन्न राज्यों/केंद्र की योजनाओं के नाम, पात्रता और सहायता राशि अलग हो सकती है। सही एवं अद्यतन जानकारी हेतु संबंधित सरकार की आधिकारिक वेबसाइट देखें।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <a
                href="https://www.india.gov.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 rounded-lg bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-lightGold transition-colors text-center w-full sm:w-auto"
              >
                सरकारी योजनाएँ देखें
              </a>
              <a
                href="https://www.myscheme.gov.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 rounded-lg bg-transparent border border-judicial-gold text-judicial-gold font-semibold hover:bg-judicial-gold/10 transition-colors text-center w-full sm:w-auto"
              >
                MyScheme पोर्टल
              </a>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-judicial-gold mb-3">अक्सर पूछे जाने वाले प्रश्न (FAQ)</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">क्या सभी राज्यों में योजना समान है?</p>
                  <p className="text-gray-300">नहीं। नाम, पात्रता तथा सहायता राशि राज्य/केंद्र के अनुसार बदल सकती है।</p>
                </div>
                <div>
                  <p className="font-medium">आधिकारिक जानकारी कहाँ मिलेगी?</p>
                  <p className="text-gray-300">संबंधित राज्य/केंद्र की आधिकारिक वेबसाइट और <a className="text-judicial-gold hover:underline" href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">MyScheme</a> पोर्टल पर देखें।</p>
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

export default MMRYojana;


