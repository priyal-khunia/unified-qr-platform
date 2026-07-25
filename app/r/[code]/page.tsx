import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { redirect } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const q = query(collection(db, "qrcodes"), where("shortCode", "==", code));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-700">This QR code is invalid or has expired.</p>
      </div>
    );
  }

  const qrDoc = snapshot.docs[0];
  const qrData = qrDoc.data();

  await addDoc(collection(db, "scans"), {
    qrId: qrDoc.id,
    scannedAt: serverTimestamp(),
  });

  if (qrData.type === "multi_link" && Array.isArray(qrData.links)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">{qrData.title}</h1>
          <div className="flex flex-col gap-3">
            {qrData.links.map((link: { label: string; url: string }, index: number) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black text-white text-center py-3 rounded hover:bg-gray-800"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (qrData.type === "business_card" && qrData.card) {
    const card = qrData.card;
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{card.name}</h1>
          {card.jobTitle && <p className="text-gray-600">{card.jobTitle}</p>}
          {card.company && <p className="text-gray-500 mb-4">{card.company}</p>}
          <div className="flex flex-col gap-3 mt-4">
            {card.phone && (
              <a href={`tel:${card.phone}`} className="block bg-black text-white py-3 rounded hover:bg-gray-800">
                Call {card.phone}
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} className="block bg-gray-800 text-white py-3 rounded hover:bg-gray-700">
                Email
              </a>
            )}
            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-200 text-gray-800 py-3 rounded hover:bg-gray-300"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  redirect(qrData.destination);
}
