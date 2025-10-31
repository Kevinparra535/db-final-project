#!/bin/bash

# Script para probar todos los endpoints de la API
# Uso: ./scripts/test-all-endpoints.sh

BASE_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "🧪 REVISIÓN DE TODOS LOS ENDPOINTS DE LA API"
echo "=================================================="
echo ""

# Función para probar un endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3

  echo -n "Testing ${method} ${endpoint} ... "

  response=$(curl -s -o /dev/null -w "%{http_code}" -X ${method} "${BASE_URL}${endpoint}")

  if [ "$response" == "200" ] || [ "$response" == "201" ]; then
    echo -e "${GREEN}✓ ${response}${NC} - ${description}"
    return 0
  elif [ "$response" == "404" ]; then
    echo -e "${YELLOW}⚠ ${response}${NC} - ${description} (No hay datos)"
    return 1
  else
    echo -e "${RED}✗ ${response}${NC} - ${description}"
    return 2
  fi
}

echo "=================================================="
echo "📍 ENDPOINTS TEMPORALES (EJEMPLO)"
echo "=================================================="
test_endpoint "GET" "/" "Home"
test_endpoint "GET" "/books" "Lista de libros (ejemplo)"
test_endpoint "GET" "/user" "Lista de usuarios (ejemplo)"
echo ""

echo "=================================================="
echo "🏛️ ENTIDADES PRINCIPALES"
echo "=================================================="
test_endpoint "GET" "/facultades" "Lista de facultades"
test_endpoint "GET" "/investigadores" "Lista de investigadores"
test_endpoint "GET" "/profesores" "Lista de profesores"
test_endpoint "GET" "/estudiantes" "Lista de estudiantes"
echo ""

echo "=================================================="
echo "🔬 GRUPOS Y LÍNEAS DE INVESTIGACIÓN"
echo "=================================================="
test_endpoint "GET" "/grupos" "Lista de grupos de investigación"
test_endpoint "GET" "/lineas" "Lista de líneas de investigación"
echo ""

echo "=================================================="
echo "📋 CONVOCATORIAS Y PROYECTOS"
echo "=================================================="
test_endpoint "GET" "/convocatorias" "Lista de convocatorias"
test_endpoint "GET" "/proyectos" "Lista de proyectos de investigación"
echo ""

echo "=================================================="
echo "📚 PRODUCTOS Y TIPOS"
echo "=================================================="
test_endpoint "GET" "/productos" "Lista de productos de investigación"
test_endpoint "GET" "/tipos-producto" "Lista de tipos de producto"
echo ""

echo "=================================================="
echo "🔗 RELACIONES"
echo "=================================================="
test_endpoint "GET" "/afiliaciones" "Lista de afiliaciones"
test_endpoint "GET" "/autorias" "Lista de autorías"
echo ""

echo "=================================================="
echo "🔍 ENDPOINTS ESPECIALIZADOS - INVESTIGADORES"
echo "=================================================="
test_endpoint "GET" "/investigadores/activos" "Investigadores activos"
echo ""

echo "=================================================="
echo "🔍 ENDPOINTS ESPECIALIZADOS - GRUPOS"
echo "=================================================="
test_endpoint "GET" "/grupos/ranking/lineas" "Ranking de grupos por líneas"
echo ""

echo "=================================================="
echo "📊 ESTADÍSTICAS"
echo "=================================================="
test_endpoint "GET" "/proyectos/estadisticas/estados" "Estadísticas de proyectos por estado"
echo ""

echo "=================================================="
echo "✅ REVISIÓN COMPLETADA"
echo "=================================================="
