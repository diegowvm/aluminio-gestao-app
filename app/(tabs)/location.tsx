import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert, FlatList } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FormInput } from "@/components/form-input";
import { LocationBadge } from "@/components/location-badge";
import { ProfileCard } from "@/components/profile-card";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function LocationScreen() {
  const colors = useColors();
  const [selectedPerfilId, setSelectedPerfilId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    setor: "",
    prateleira: "",
    gaveta: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPerfisDropdown, setShowPerfisDropdown] = useState(false);

  const { data: perfis, isLoading: perfisLoading } = trpc.perfis.list.useQuery();
  const { data: localizacao } = trpc.localizacoes.getByPerfilId.useQuery(
    { perfilId: selectedPerfilId || 0 },
    { enabled: selectedPerfilId !== null }
  );

  const createMutation = trpc.localizacoes.create.useMutation({
    onSuccess: () => {
      Alert.alert("Sucesso", "Localização registrada com sucesso!");
      setFormData({ setor: "", prateleira: "", gaveta: "", observacoes: "" });
      setErrors({});
    },
    onError: (error) => {
      Alert.alert("Erro", error.message || "Falha ao registrar localização");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedPerfilId) {
      newErrors.perfil = "Selecione um perfil";
    }
    if (!formData.setor.trim()) {
      newErrors.setor = "Setor é obrigatório";
    }
    if (!formData.prateleira.trim()) {
      newErrors.prateleira = "Prateleira é obrigatória";
    }
    if (!formData.gaveta.trim()) {
      newErrors.gaveta = "Gaveta é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    createMutation.mutate({
      perfilId: selectedPerfilId!,
      setor: formData.setor,
      prateleira: parseInt(formData.prateleira),
      gaveta: parseInt(formData.gaveta),
      observacoes: formData.observacoes || undefined,
    });
  };

  const selectedPerfil = perfis?.find((p) => p.id === selectedPerfilId);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Localização no Estoque</Text>
            <Text className="text-sm text-muted">Registre a localização dos perfis</Text>
          </View>

          {/* Seleção de Perfil */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Selecione um Perfil *</Text>
            <Pressable
              onPress={() => setShowPerfisDropdown(!showPerfisDropdown)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="bg-surface border border-border rounded-lg px-3 py-3"
            >
              <Text className="text-foreground">
                {selectedPerfil ? selectedPerfil.codigoPerfil : "Toque para selecionar..."}
              </Text>
            </Pressable>

            {showPerfisDropdown && perfisLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : showPerfisDropdown ? (
              <View className="bg-surface border border-border rounded-lg max-h-64">
                <FlatList
                  data={perfis}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setSelectedPerfilId(item.id);
                        setShowPerfisDropdown(false);
                      }}
                      className="px-3 py-2 border-b border-border"
                    >
                      <Text className="text-foreground">{item.codigoPerfil} - {item.nomePerfil}</Text>
                    </Pressable>
                  )}
                />
              </View>
            ) : null}

            {errors.perfil && <Text className="text-xs text-error">{errors.perfil}</Text>}
          </View>

          {/* Perfil Selecionado */}
          {selectedPerfil && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Perfil Selecionado</Text>
              <ProfileCard
                codigo={selectedPerfil.codigoPerfil}
                nome={selectedPerfil.nomePerfil}
                altura={selectedPerfil.alturaMm}
                largura={selectedPerfil.larguraMm}
                espessura={selectedPerfil.espessuraMm}
              />
            </View>
          )}

          {/* Formulário */}
          <View className="gap-4">
            <FormInput
              label="Setor *"
              placeholder="Ex: A"
              value={formData.setor}
              onChangeText={(text) => setFormData({ ...formData, setor: text.toUpperCase() })}
              error={errors.setor}
              maxLength={10}
            />

            <View className="flex-row gap-2">
              <FormInput
                label="Prateleira *"
                placeholder="1"
                value={formData.prateleira}
                onChangeText={(text) => setFormData({ ...formData, prateleira: text })}
                keyboardType="number-pad"
                error={errors.prateleira}
                containerClassName="flex-1"
              />
              <FormInput
                label="Gaveta *"
                placeholder="1"
                value={formData.gaveta}
                onChangeText={(text) => setFormData({ ...formData, gaveta: text })}
                keyboardType="number-pad"
                error={errors.gaveta}
                containerClassName="flex-1"
              />
            </View>

            <FormInput
              label="Observações"
              placeholder="Ex: Próximo à janela"
              value={formData.observacoes}
              onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Localização Atual */}
          {localizacao && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Localização Atual</Text>
              <LocationBadge
                setor={localizacao.setor}
                prateleira={localizacao.prateleira}
                gaveta={localizacao.gaveta}
              />
            </View>
          )}

          {/* Botões */}
          <View className="gap-2 flex-row">
            <Pressable
              onPress={() => {
                setFormData({ setor: "", prateleira: "", gaveta: "", observacoes: "" });
                setErrors({});
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
            >
              <Text className="text-foreground font-semibold">Limpar</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={createMutation.isPending}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="flex-1 bg-primary rounded-lg py-3 items-center"
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Atualizar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
