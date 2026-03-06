import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FormInput } from "@/components/form-input";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useColors();
  const [formData, setFormData] = useState({
    codigoPerfil: "",
    nomePerfil: "",
    linha: "",
    alturaMm: "",
    larguraMm: "",
    espessuraMm: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = trpc.perfis.create.useMutation({
    onSuccess: () => {
      Alert.alert("Sucesso", "Perfil cadastrado com sucesso!");
      setFormData({
        codigoPerfil: "",
        nomePerfil: "",
        linha: "",
        alturaMm: "",
        larguraMm: "",
        espessuraMm: "",
        observacoes: "",
      });
      setErrors({});
    },
    onError: (error) => {
      Alert.alert("Erro", error.message || "Falha ao cadastrar perfil");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigoPerfil.trim()) {
      newErrors.codigoPerfil = "Código é obrigatório";
    }
    if (!formData.nomePerfil.trim()) {
      newErrors.nomePerfil = "Nome é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    createMutation.mutate({
      codigoPerfil: formData.codigoPerfil,
      nomePerfil: formData.nomePerfil,
      linha: formData.linha || undefined,
      alturaMm: formData.alturaMm || undefined,
      larguraMm: formData.larguraMm || undefined,
      espessuraMm: formData.espessuraMm || undefined,
      observacoes: formData.observacoes || undefined,
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Novo Perfil</Text>
            <Text className="text-sm text-muted">Cadastre um novo perfil de alumínio</Text>
          </View>

          {/* Formulário */}
          <View className="gap-4">
            <FormInput
              label="Código do Perfil *"
              placeholder="Ex: PF-001"
              value={formData.codigoPerfil}
              onChangeText={(text) => setFormData({ ...formData, codigoPerfil: text })}
              error={errors.codigoPerfil}
              maxLength={50}
            />

            <FormInput
              label="Nome do Perfil *"
              placeholder="Ex: Perfil Estrutural"
              value={formData.nomePerfil}
              onChangeText={(text) => setFormData({ ...formData, nomePerfil: text })}
              error={errors.nomePerfil}
              maxLength={100}
            />

            <FormInput
              label="Linha"
              placeholder="Ex: Série A"
              value={formData.linha}
              onChangeText={(text) => setFormData({ ...formData, linha: text })}
              maxLength={50}
            />

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Medidas (mm)</Text>
              <View className="flex-row gap-2">
                <FormInput
                  label="Altura"
                  placeholder="0.00"
                  value={formData.alturaMm}
                  onChangeText={(text) => setFormData({ ...formData, alturaMm: text })}
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
                <FormInput
                  label="Largura"
                  placeholder="0.00"
                  value={formData.larguraMm}
                  onChangeText={(text) => setFormData({ ...formData, larguraMm: text })}
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
                <FormInput
                  label="Espessura"
                  placeholder="0.00"
                  value={formData.espessuraMm}
                  onChangeText={(text) => setFormData({ ...formData, espessuraMm: text })}
                  keyboardType="decimal-pad"
                  containerClassName="flex-1"
                />
              </View>
            </View>

            <FormInput
              label="Observações"
              placeholder="Informações adicionais..."
              value={formData.observacoes}
              onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Botões */}
          <View className="gap-2 flex-row">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
            >
              <Text className="text-foreground font-semibold">Cancelar</Text>
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
                <Text className="text-white font-semibold">Salvar Perfil</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
