// import React, { useEffect, useRef, useState } from 'react';
// import { Colors } from '../constants/Colors';

// interface Location {
//   lat: number;
//   lng: number;
//   address: string;
//   sector?: string;
//   city?: string;
//   country?: string;
// }

// interface LocationSelectorProps {
//   onLocationSelect: (location: Location) => void;
//   initialLocation?: Location;
//   placeholder?: string;
//   className?: string;
// }

// const LocationSelector: React.FC<LocationSelectorProps> = ({
//   onLocationSelect,
//   initialLocation,
//   placeholder = "Buscar ubicación...",
//   className = ""
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [marker, setMarker] = useState<google.maps.Marker | null>(null);
//   const [isMapLoaded, setIsMapLoaded] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
  
//   const mapRef = useRef<HTMLDivElement>(null);
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   // Mock data para sugerencias de búsqueda (en un caso real, usarías una API como Google Places)
//   const mockSuggestions = [
//     {
//       description: "Santo Domingo, Distrito Nacional, República Dominicana",
//       place_id: "1",
//       structured_formatting: {
//         main_text: "Santo Domingo",
//         secondary_text: "Distrito Nacional, República Dominicana"
//       }
//     },
//     {
//       description: "Santiago de los Caballeros, Santiago, República Dominicana",
//       place_id: "2",
//       structured_formatting: {
//         main_text: "Santiago de los Caballeros",
//         secondary_text: "Santiago, República Dominicana"
//       }
//     },
//     {
//       description: "La Romana, La Romana, República Dominicana",
//       place_id: "3",
//       structured_formatting: {
//         main_text: "La Romana",
//         secondary_text: "La Romana, República Dominicana"
//       }
//     },
//     {
//       description: "San Pedro de Macorís, San Pedro de Macorís, República Dominicana",
//       place_id: "4",
//       structured_formatting: {
//         main_text: "San Pedro de Macorís",
//         secondary_text: "San Pedro de Macorís, República Dominicana"
//       }
//     },
//     {
//       description: "Higüey, La Altagracia, República Dominicana",
//       place_id: "5",
//       structured_formatting: {
//         main_text: "Higüey",
//         secondary_text: "La Altagracia, República Dominicana"
//       }
//     }
//   ];

//   // Inicializar mapa
//   useEffect(() => {
//     if (mapRef.current && !map) {
//       const loadGoogleMaps = () => {
//         if (window.google) {
//           initializeMap();
//         } else {
//           // En un caso real, cargarías la API de Google Maps aquí
//           setTimeout(() => {
//             if (window.google) {
//               initializeMap();
//             } else {
//               // Fallback si Google Maps no está disponible
//               setIsMapLoaded(true);
//             }
//           }, 1000);
//         }
//       };

//       const initializeMap = () => {
//         const defaultCenter = selectedLocation 
//           ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
//           : { lat: 18.4861, lng: -69.9312 }; // Santo Domingo por defecto

//         const googleMap = new google.maps.Map(mapRef.current!, {
//           center: defaultCenter,
//           zoom: 12,
//           styles: [
//             {
//               featureType: "all",
//               elementType: "geometry",
//               stylers: [{ color: "#242f3e" }]
//             },
//             {
//               featureType: "all",
//               elementType: "labels.text.stroke",
//               stylers: [{ color: "#242f3e" }]
//             },
//             {
//               featureType: "all",
//               elementType: "labels.text.fill",
//               stylers: [{ color: "#746855" }]
//             },
//             {
//               featureType: "poi",
//               elementType: "labels",
//               stylers: [{ visibility: "off" }]
//             }
//           ]
//         });

//         // Agregar marcador si hay ubicación inicial
//         if (selectedLocation) {
//           const newMarker = new google.maps.Marker({
//             position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
//             map: googleMap,
//             draggable: true,
//             title: selectedLocation.address
//           });

//           newMarker.addListener('dragend', () => {
//             const position = newMarker.getPosition();
//             if (position) {
//               handleMapClick({
//                 lat: position.lat(),
//                 lng: position.lng()
//               });
//             }
//           });

//           setMarker(newMarker);
//         }

//         // Agregar listener para clicks en el mapa
//         googleMap.addListener('click', (event: google.maps.MapMouseEvent) => {
//           if (event.latLng) {
//             handleMapClick({
//               lat: event.latLng.lat(),
//               lng: event.latLng.lng()
//             });
//           }
//         });

//         setMap(googleMap);
//         setIsMapLoaded(true);
//       };

//       loadGoogleMaps();
//     }
//   }, [map, selectedLocation]);

//   // Manejar búsqueda
//   const handleSearch = async (query: string) => {
//     setSearchQuery(query);
    
//     if (query.length > 2) {
//       setIsSearching(true);
//       // Simular búsqueda con datos mock
//       const filtered = mockSuggestions.filter(suggestion =>
//         suggestion.description.toLowerCase().includes(query.toLowerCase())
//       );
//       setSuggestions(filtered);
//       setIsSearching(false);
//     } else {
//       setSuggestions([]);
//     }
//   };

//   // Manejar selección de sugerencia
//   const handleSuggestionSelect = (suggestion: any) => {
//     setSearchQuery(suggestion.structured_formatting.main_text);
//     setSuggestions([]);
    
//     // Simular geocoding (en un caso real, usarías Google Geocoding API)
//     const mockGeocodedLocation: Location = {
//       lat: 18.4861 + (Math.random() - 0.5) * 0.1,
//       lng: -69.9312 + (Math.random() - 0.5) * 0.1,
//       address: suggestion.description,
//       sector: suggestion.structured_formatting.main_text,
//       city: suggestion.structured_formatting.secondary_text.split(',')[0],
//       country: "República Dominicana"
//     };

//     setSelectedLocation(mockGeocodedLocation);
//     onLocationSelect(mockGeocodedLocation);

//     // Mover mapa a la ubicación seleccionada
//     if (map) {
//       map.setCenter({ lat: mockGeocodedLocation.lat, lng: mockGeocodedLocation.lng });
//       map.setZoom(15);

//       // Actualizar o crear marcador
//       if (marker) {
//         marker.setPosition({ lat: mockGeocodedLocation.lat, lng: mockGeocodedLocation.lng });
//       } else {
//         const newMarker = new google.maps.Marker({
//           position: { lat: mockGeocodedLocation.lat, lng: mockGeocodedLocation.lng },
//           map: map,
//           draggable: true,
//           title: mockGeocodedLocation.address
//         });

//         newMarker.addListener('dragend', () => {
//           const position = newMarker.getPosition();
//           if (position) {
//             handleMapClick({
//               lat: position.lat(),
//               lng: position.lng()
//             });
//           }
//         });

//         setMarker(newMarker);
//       }
//     }
//   };

//   // Manejar click en el mapa
//   const handleMapClick = (latLng: { lat: number; lng: number }) => {
//     // Simular reverse geocoding (en un caso real, usarías Google Reverse Geocoding API)
//     const mockAddress: Location = {
//       lat: latLng.lat,
//       lng: latLng.lng,
//       address: `Ubicación seleccionada (${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)})`,
//       sector: "Sector desconocido",
//       city: "Ciudad desconocida",
//       country: "República Dominicana"
//     };

//     setSelectedLocation(mockAddress);
//     setSearchQuery(mockAddress.address);
//     onLocationSelect(mockAddress);

//     // Actualizar o crear marcador
//     if (marker) {
//       marker.setPosition(latLng);
//     } else if (map) {
//       const newMarker = new google.maps.Marker({
//         position: latLng,
//         map: map,
//         draggable: true,
//         title: mockAddress.address
//       });

//       newMarker.addListener('dragend', () => {
//         const position = newMarker.getPosition();
//         if (position) {
//           handleMapClick({
//             lat: position.lat(),
//             lng: position.lng()
//           });
//         }
//       });

//       setMarker(newMarker);
//     }
//   };

//   // Usar mi ubicación actual
//   const handleUseCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const latLng = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           };
//           handleMapClick(latLng);
//         },
//         (error) => {
//           alert('No se pudo obtener tu ubicación. Asegúrate de que los servicios de ubicación estén activados.');
//           console.error('Error getting location:', error);
//         }
//       );
//     } else {
//       alert('La geolocalización no es soportada por este navegador.');
//     }
//   };

//   // Limpiar selección
//   const handleClearLocation = () => {
//     setSelectedLocation(null);
//     setSearchQuery('');
//     setSuggestions([]);
//     if (marker) {
//       marker.setMap(null);
//       setMarker(null);
//     }
//     onLocationSelect({ lat: 0, lng: 0, address: '' });
//   };

//   return (
//     <>
//       <style>
//         {`
//           .location-selector {
//             background: white;
//             border-radius: 12px;
//             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//             transition: all 0.3s ease;
//           }

//           .location-selector:hover {
//             box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
//           }

//           .search-container {
//             position: relative;
//             padding: 20px;
//             border-bottom: 1px solid #e5e7eb;
//             background: #f8fafc;
//           }

//           .search-input {
//             width: 100%;
//             padding: 12px 16px;
//             border: 2px solid #e5e7eb;
//             border-radius: 8px;
//             font-size: 14px;
//             transition: all 0.3s ease;
//             background: white;
//           }

//           .search-input:focus {
//             outline: none;
//             border-color: ${Colors.detailAppColor};
//             box-shadow: 0 0 0 3px ${Colors.detailAppColor}20;
//           }

//           .suggestions-list {
//             position: absolute;
//             top: 100%;
//             left: 20px;
//             right: 20px;
//             background: white;
//             border: 1px solid #e5e7eb;
//             border-radius: 8px;
//             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
//             max-height: 200px;
//             overflow-y: auto;
//             z-index: 1000;
//             margin-top: 4px;
//           }

//           .suggestion-item {
//             padding: 12px 16px;
//             cursor: pointer;
//             border-bottom: 1px solid #f3f4f6;
//             transition: background-color 0.2s ease;
//           }

//           .suggestion-item:hover {
//             background-color: #f3f4f6;
//           }

//           .suggestion-item:last-child {
//             border-bottom: none;
//           }

//           .suggestion-main {
//             font-weight: 500;
//             color: #1f2937;
//             font-size: 14px;
//           }

//           .suggestion-secondary {
//             font-size: 12px;
//             color: #6b7280;
//             margin-top: 2px;
//           }

//           .location-actions {
//             display: flex;
//             gap: 10px;
//             margin-top: 12px;
//           }

//           .action-button {
//             flex: 1;
//             padding: 8px 12px;
//             border: 1px solid #d1d5db;
//             border-radius: 6px;
//             background: white;
//             color: #374151;
//             font-size: 12px;
//             font-weight: 500;
//             cursor: pointer;
//             transition: all 0.2s ease;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 6px;
//           }

//           .action-button:hover {
//             background: #f9fafb;
//             border-color: #9ca3af;
//           }

//           .action-button.primary {
//             background: ${Colors.detailAppColor};
//             border-color: ${Colors.detailAppColor};
//             color: white;
//           }

//           .action-button.primary:hover {
//             background: ${Colors.detailAppColor}dd;
//           }

//           .map-container {
//             height: 300px;
//             position: relative;
//             background: #f3f4f6;
//           }

//           .map-placeholder {
//             height: 100%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
//             color: #6b7280;
//             font-size: 14px;
//           }

//           .selected-location {
//             padding: 16px 20px;
//             background: #f0f9ff;
//             border-top: 1px solid #e0f2fe;
//           }

//           .location-info {
//             display: flex;
//             justify-content: between;
//             align-items: center;
//           }

//           .location-details {
//             flex: 1;
//           }

//           .location-address {
//             font-weight: 500;
//             color: #0369a1;
//             font-size: 14px;
//             margin-bottom: 4px;
//           }

//           .location-coordinates {
//             font-size: 12px;
//             color: #6b7280;
//           }

//           .clear-button {
//             background: none;
//             border: none;
//             color: #ef4444;
//             cursor: pointer;
//             padding: 4px 8px;
//             border-radius: 4px;
//             font-size: 12px;
//             transition: background-color 0.2s ease;
//           }

//           .clear-button:hover {
//             background: #fef2f2;
//           }

//           .loading-spinner {
//             display: inline-block;
//             width: 16px;
//             height: 16px;
//             border: 2px solid #f3f4f6;
//             border-top: 2px solid ${Colors.detailAppColor};
//             border-radius: 50%;
//             animation: spin 1s linear infinite;
//           }

//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }

//           .search-icon {
//             position: absolute;
//             left: 16px;
//             top: 50%;
//             transform: translateY(-50%);
//             color: #9ca3af;
//           }

//           .input-wrapper {
//             position: relative;
//           }

//           .input-wrapper input {
//             padding-left: 40px;
//           }
//         `}
//       </style>

//       <div className={`location-selector ${className}`}>
//         {/* Barra de búsqueda */}
//         <div className="search-container">
//           <div className="input-wrapper">
//             <span className="search-icon">🔍</span>
//             <input
//               ref={searchInputRef}
//               type="text"
//               className="search-input"
//               placeholder={placeholder}
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//               onFocus={() => {
//                 if (searchQuery.length > 2) {
//                   setIsSearching(true);
//                 }
//               }}
//             />
//           </div>

//           {/* Sugerencias */}
//           {suggestions.length > 0 && (
//             <div className="suggestions-list">
//               {suggestions.map((suggestion) => (
//                 <div
//                   key={suggestion.place_id}
//                   className="suggestion-item"
//                   onClick={() => handleSuggestionSelect(suggestion)}
//                 >
//                   <div className="suggestion-main">
//                     {suggestion.structured_formatting.main_text}
//                   </div>
//                   <div className="suggestion-secondary">
//                     {suggestion.structured_formatting.secondary_text}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Botones de acción */}
//           <div className="location-actions">
//             <button
//               className="action-button"
//               onClick={handleUseCurrentLocation}
//               title="Usar mi ubicación actual"
//             >
//               📍 Mi Ubicación
//             </button>
//             {selectedLocation && (
//               <button
//                 className="action-button"
//                 onClick={handleClearLocation}
//                 title="Limpiar ubicación"
//               >
//                 🗑️ Limpiar
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Mapa */}
//         <div className="map-container">
//           {isMapLoaded ? (
//             <div 
//               ref={mapRef} 
//               style={{ 
//                 width: '100%', 
//                 height: '100%',
//                 borderRadius: '0 0 12px 12px'
//               }} 
//             />
//           ) : (
//             <div className="map-placeholder">
//               {isSearching ? (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div className="loading-spinner"></div>
//                   Cargando mapa...
//                 </div>
//               ) : (
//                 'Mapa no disponible'
//               )}
//             </div>
//           )}
//         </div>

//         {/* Información de ubicación seleccionada */}
//         {selectedLocation && (
//           <div className="selected-location">
//             <div className="location-info">
//               <div className="location-details">
//                 <div className="location-address">
//                   {selectedLocation.address}
//                 </div>
//                 <div className="location-coordinates">
//                   {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
//                 </div>
//               </div>
//               <button
//                 className="clear-button"
//                 onClick={handleClearLocation}
//                 title="Limpiar ubicación"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default LocationSelector;


export const LocationSelector = () => {
  return (
    <div>LocationSelector</div>
  )
}
