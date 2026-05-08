import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Upload, Sparkles, Check, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { candidatos, getErrorMessage } from "../../lib/api";

export default function ProfileCreation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    ubicacion: "",
    carrera: "",
    descripcion: "",
    habilidades: [] as string[],
    idiomas: [] as string[],
    cvFile: null as File | null,
  });
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await candidatos.me();
        setFormData((prev) => ({
          ...prev,
          nombre: me.nombre || "",
          telefono: me.telefono || "",
          ubicacion: me.ubicacion || "",
          carrera: me.carrera || "",
          descripcion: me.descripcion || "",
          habilidades: me.habilidades ?? [],
          idiomas: me.idiomas ?? [],
        }));
      } catch (e: unknown) {
        toast.error(getErrorMessage(e, "No se pudo cargar tu perfil"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cvFile: e.target.files[0] });
    }
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || formData.habilidades.includes(v)) return;
    setFormData({ ...formData, habilidades: [...formData.habilidades, v] });
    setSkillInput("");
  };
  const addLang = () => {
    const v = langInput.trim();
    if (!v || formData.idiomas.includes(v)) return;
    setFormData({ ...formData, idiomas: [...formData.idiomas, v] });
    setLangInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("nombre", formData.nombre);
    fd.append("telefono", formData.telefono);
    fd.append("ubicacion", formData.ubicacion);
    fd.append("carrera", formData.carrera);
    fd.append("descripcion", formData.descripcion);
    fd.append("habilidades", JSON.stringify(formData.habilidades));
    fd.append("idiomas", JSON.stringify(formData.idiomas));
    if (formData.cvFile) fd.append("cv", formData.cvFile);
    try {
      await candidatos.updateMe(fd);
      toast.success("Perfil actualizado");
      navigate("/student");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Error al guardar perfil"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-[#003366]">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#003366] to-[#28a745]">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#003366]" />
              </div>
              <span className="text-xl font-bold text-white">JOBDER</span>
            </Link>
          </div>
        </div>
      </nav>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>

        <Card className="rounded-3xl border-4 border-white/20 shadow-2xl">
          <CardContent className="p-8 md:p-12 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#003366]">Información Básica</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" className="h-12 rounded-2xl" value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" className="h-12 rounded-2xl" value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input id="ubicacion" className="h-12 rounded-2xl" value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrera">Carrera</Label>
                  <Input id="carrera" className="h-12 rounded-2xl" value={formData.carrera}
                    onChange={(e) => setFormData({ ...formData, carrera: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Sobre Ti</Label>
                <Textarea id="descripcion" className="min-h-32 rounded-2xl" value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#003366]">Habilidades</h2>
              <div className="flex gap-2">
                <Input className="h-12 rounded-2xl" placeholder="React, TypeScript…"
                  value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); }}} />
                <Button type="button" onClick={addSkill} className="rounded-2xl bg-[#003366] text-white">Agregar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.habilidades.map((s) => (
                  <Badge key={s} className="rounded-full bg-[#28a745]/10 text-[#28a745] cursor-pointer"
                    onClick={() => setFormData({ ...formData, habilidades: formData.habilidades.filter((x) => x !== s) })}>
                    {s} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#003366]">Idiomas</h2>
              <div className="flex gap-2">
                <Input className="h-12 rounded-2xl" placeholder="Español, Inglés…"
                  value={langInput} onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLang(); }}} />
                <Button type="button" onClick={addLang} className="rounded-2xl bg-[#003366] text-white">Agregar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.idiomas.map((s) => (
                  <Badge key={s} className="rounded-full bg-[#003366]/10 text-[#003366] cursor-pointer"
                    onClick={() => setFormData({ ...formData, idiomas: formData.idiomas.filter((x) => x !== s) })}>
                    {s} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#003366]">CV (PDF)</h2>
              <div className="border-4 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-[#003366] transition-colors">
                <input type="file" id="cv-upload" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#003366] to-[#28a745] flex items-center justify-center">
                      {formData.cvFile ? <Check className="w-8 h-8 text-white" /> : <Upload className="w-8 h-8 text-white" />}
                    </div>
                    {formData.cvFile ? (
                      <div>
                        <p className="text-lg font-semibold text-[#28a745]">{formData.cvFile.name}</p>
                        <p className="text-sm text-gray-600">Se procesará al guardar</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-semibold text-[#003366]">Selecciona tu CV</p>
                        <p className="text-sm text-gray-600">Se combinará con tu perfil para el matching</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" className="flex-1 h-14 rounded-full border-2"
                onClick={() => navigate("/student")}>Cancelar</Button>
              <Button type="submit" disabled={saving}
                className="flex-1 h-14 rounded-full bg-[#28a745] hover:bg-[#28a745]/90 text-white">
                <Save className="w-5 h-5 mr-2" />
                {saving ? "Guardando…" : "Guardar perfil"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
